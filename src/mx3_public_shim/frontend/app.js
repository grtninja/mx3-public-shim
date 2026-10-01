/* MX3 Public Shim — bundled status UI.
 *
 * Public contract: this UI talks ONLY to the backend shipped in this repo
 * (src/mx3_public_shim/server.py). It never calls the private-workstation
 * MX3 support service (:9000) or the MXA manager boundary (:10000); those
 * are not part of this repository.
 *
 * Two launch modes:
 *  - Served by the backend (python -m mx3_public_shim.server): same-origin.
 *  - Electron desktop shell (file://): falls back to http://127.0.0.1:9015,
 *    so start the backend first. Override with
 *    window.__MX3_PUBLIC_SHIM_BACKEND__ or localStorage
 *    "mx3PublicShim.backendBase".
 */

const DEFAULT_BACKEND_BASE = 'http://127.0.0.1:9015';
const REQUEST_TIMEOUT_MS = 4000;
const AUTO_REFRESH_INTERVAL_MS = 5000;

function loadTextStorage(key, fallbackValue) {
  try {
    return window.localStorage.getItem(key) || fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveTextStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function resolveBackendBase() {
  const override =
    (typeof window !== 'undefined' && window.__MX3_PUBLIC_SHIM_BACKEND__) ||
    loadTextStorage('mx3PublicShim.backendBase', '');
  if (override) {
    return String(override).replace(/\/$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.protocol === 'http:' || window.location.protocol === 'https:')
  ) {
    return window.location.origin;
  }
  return DEFAULT_BACKEND_BASE;
}

const BACKEND_BASE = resolveBackendBase();
const ENDPOINTS = {
  healthz: `${BACKEND_BASE}/healthz`,
  providerStatus: `${BACKEND_BASE}/api/provider-status`,
};

let autoRefreshTimer = 0;

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function setStatusTone(selector, tone) {
  const node = document.querySelector(selector);
  const pill = node?.closest('.status-pill');
  if (pill) {
    pill.dataset.tone = tone || 'neutral';
  }
}

function renderStatus(text) {
  setText('#control-status', text);
}

async function copyText(value, label) {
  await navigator.clipboard.writeText(String(value || ''));
  renderStatus(`${label} copied.`);
}

async function loadJson(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function providerByName(providers, name) {
  return (providers || []).find((row) => row?.name === name) || null;
}

function selectedFor(statusReport, capability) {
  const row = (statusReport?.selected || []).find((item) => item?.capability === capability);
  return row ? row.provider : null;
}

function shortBase(value) {
  return String(value || '').replace(/^https?:\/\//, '');
}

function buildState(report) {
  const runtime = report?.runtime || {};
  const providers = Array.isArray(runtime.providers) ? runtime.providers : [];
  const mx3 = providerByName(providers, 'mx3_linux');
  const openai = providerByName(providers, 'openai_compat');
  const cpu = providerByName(providers, 'cpu_reference');
  const chatProvider = selectedFor(runtime, 'chat');
  const embeddingsProvider = selectedFor(runtime, 'embeddings');
  const openaiBaseUrl = openai?.metadata?.base_url || null;
  return {
    ok: Boolean(report?.ok),
    backendBase: BACKEND_BASE,
    platform: report?.platform || {},
    providerOrder: Array.isArray(runtime.provider_order) ? runtime.provider_order : [],
    providers,
    chatProvider,
    embeddingsProvider,
    mx3,
    openai,
    cpu,
    openaiBaseUrl,
    dfp: mx3?.metadata?.dfp || null,
    boundaries: Array.isArray(report?.official_boundaries) ? report.official_boundaries : [],
    fetchedAt: new Date().toISOString(),
  };
}

function describeProviderSelection(state) {
  const lines = [];
  lines.push(
    state.chatProvider
      ? `Chat: ${state.chatProvider}${state.openaiBaseUrl && state.chatProvider === 'openai_compat' ? ` -> ${shortBase(state.openaiBaseUrl)}` : ''}`
      : 'Chat: no provider selected',
  );
  lines.push(
    state.embeddingsProvider
      ? `Embeddings: ${state.embeddingsProvider}`
      : 'Embeddings: no provider selected',
  );
  lines.push(`Provider order: ${state.providerOrder.length ? state.providerOrder.join(', ') : 'n/a'}`);
  return lines;
}

function renderState(state) {
  const chatLabel = state.chatProvider || 'none';
  setText('#plane-status', state.chatProvider ? `Selected (${chatLabel}) — falls through on failure` : 'No chat provider');
  setText(
    '#plane-note',
    state.chatProvider === 'openai_compat' && state.openaiBaseUrl
      ? `Forwarded to ${shortBase(state.openaiBaseUrl)} — the shim never serves chat itself`
      : `Provider: ${chatLabel}`,
  );
  setStatusTone('#plane-status', state.chatProvider ? 'good' : 'warn');

  const embedLabel = state.embeddingsProvider || 'none';
  setText('#embed-status', state.embeddingsProvider ? `Selected (${embedLabel}) — falls through on failure` : 'No embeddings provider');
  const dims = state.cpu?.metadata?.dimensions;
  setText(
    '#embed-note',
    state.embeddingsProvider === 'cpu_reference' && dims
      ? `Deterministic CPU reference (${dims} dims) — offline fallback`
      : `Provider: ${embedLabel}`,
  );
  setStatusTone('#embed-status', state.embeddingsProvider ? 'good' : 'warn');

  const mx3Available = Boolean(state.mx3?.available);
  setText('#device-status', mx3Available ? 'MX3 available' : 'MX3 unavailable');
  setText('#device-note', String(state.mx3?.detail || 'no MX3 provider report'));
  setStatusTone('#device-status', mx3Available ? 'good' : 'warn');

  const system = state.platform?.system || 'unknown';
  setText('#backend-status', state.ok ? 'Online' : 'Degraded');
  setText('#backend-note', `${shortBase(state.backendBase)} • ${system}`);
  setStatusTone('#backend-status', state.ok ? 'good' : 'error');

  renderList('#runtime-summary-list', [
    ...describeProviderSelection(state),
    `MX3 direct runtime: ${mx3Available ? 'visible' : 'not visible'} (${String(state.mx3?.detail || 'n/a')})`,
    `Embed DFP env: ${state.dfp ? state.dfp : 'MX3_PUBLIC_SHIM_EMBED_DFP not set'}`,
  ]);

  renderList(
    '#config-list',
    [
      `Backend: ${state.backendBase}`,
      `OpenAI-compatible endpoint: ${state.openaiBaseUrl || 'not configured'}`,
      ...state.boundaries.map((line) => `Boundary: ${line}`),
    ],
  );

  renderProviderCards(state.providers);
}

function renderList(selector, items) {
  const node = document.querySelector(selector);
  if (!node) return;
  node.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    node.appendChild(li);
  }
}

function renderProviderCards(providers) {
  const node = document.querySelector('#provider-cards');
  if (!node) return;
  node.innerHTML = '';
  for (const row of providers || []) {
    const card = document.createElement('article');
    card.className = 'metric-card';
    const title = document.createElement('h3');
    title.textContent = row?.name || 'unknown';
    const value = document.createElement('p');
    value.className = 'card-value';
    value.textContent = row?.available ? 'Available' : 'Unavailable';
    const note = document.createElement('p');
    note.className = 'note';
    const caps = [
      row?.supports_chat ? 'chat' : null,
      row?.supports_embeddings ? 'embeddings' : null,
    ].filter(Boolean);
    note.textContent = `${caps.length ? caps.join(' + ') : 'no capabilities'} • ${String(row?.detail || '')}`;
    card.appendChild(title);
    card.appendChild(value);
    card.appendChild(note);
    node.appendChild(card);
  }
}

function renderUnreachable(error) {
  for (const [selector, label] of [
    ['#plane-status', 'plane'],
    ['#embed-status', 'embed'],
    ['#device-status', 'device'],
    ['#backend-status', 'backend'],
  ]) {
    setText(selector, 'Unreachable');
    setStatusTone(selector, 'error');
  }
  setText('#plane-note', `Backend ${shortBase(BACKEND_BASE)} did not answer`);
  setText('#embed-note', 'Start it with: python -m mx3_public_shim.server');
  setText('#device-note', 'No provider report without the backend');
  setText('#backend-note', String(error?.message || error));
  renderList('#runtime-summary-list', [
    `Backend unreachable at ${BACKEND_BASE}.`,
    'Start the shipped backend first: python -m mx3_public_shim.server',
    'Desktop shell: start the backend, then npm run desktop:start.',
  ]);
  renderList('#config-list', [`Backend: ${BACKEND_BASE} (unreachable)`]);
  const node = document.querySelector('#provider-cards');
  if (node) node.innerHTML = '';
}

let refreshInFlight = false;

async function refreshState(options = {}) {
  const silent = Boolean(options?.silent);
  if (refreshInFlight) return;
  refreshInFlight = true;
  try {
    const report = await loadJson(ENDPOINTS.healthz);
    renderState(buildState(report));
    if (!silent) renderStatus(`Status refreshed from ${shortBase(BACKEND_BASE)}.`);
  } catch (error) {
    renderUnreachable(error);
    if (!silent) renderStatus(`Backend unreachable: ${String(error?.message || error)}`);
  } finally {
    refreshInFlight = false;
  }
}

function startAutoRefresh() {
  if (autoRefreshTimer) return;
  autoRefreshTimer = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    void refreshState({ silent: true });
  }, AUTO_REFRESH_INTERVAL_MS);
}

function wireControls() {
  document
    .querySelector('#refresh-runtime-btn')
    ?.addEventListener('click', () =>
      refreshState().catch((error) => renderStatus(`Refresh failed: ${String(error)}`)),
    );
  document
    .querySelector('#validate-mx3-btn')
    ?.addEventListener('click', () =>
      refreshState().then(() => {
        const mx3Note = document.querySelector('#device-note')?.textContent || '';
        renderStatus(`MX3 check: ${mx3Note}`);
      }).catch((error) => renderStatus(`Validation failed: ${String(error)}`)),
    );
  document.querySelectorAll('.copy-link-btn').forEach((button) => {
    button.addEventListener('click', () => {
      copyText(button.dataset.copy || '', button.dataset.copyLabel || 'Link').catch((error) => {
        renderStatus(`Copy failed: ${String(error)}`);
      });
    });
  });
}

wireControls();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    void refreshState({ silent: true });
  }
});
window.addEventListener('focus', () => {
  void refreshState({ silent: true });
});
window.addEventListener('load', () => {
  renderStatus(`Contacting backend at ${shortBase(BACKEND_BASE)}...`);
  startAutoRefresh();
  void refreshState({ silent: true });
});
