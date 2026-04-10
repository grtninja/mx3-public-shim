const ENDPOINTS = {
  health: 'http://127.0.0.1:9000/health/core?readiness=0',
  telemetryReport: 'http://127.0.0.1:9000/telemetry/report',
  modelState: 'http://127.0.0.1:9000/api/model-service/state',
  feederConfig: 'http://127.0.0.1:9000/api/mx3/continuous-feed/config',
  // Important: do not trigger repo-wide resource sync on page load.
  // Catalog sync should be explicit (or done out-of-band), otherwise it can disturb a live feeder.
  dfpCatalog: 'http://127.0.0.1:9000/api/mx3/dfp-catalog?sync_resources=0',
  runtimePrepareStop: 'http://127.0.0.1:9000/api/runtime/prepare-stop',
  mx3LoadModel: 'http://127.0.0.1:9000/api/mx3/load-model',
};

const MX3_MANAGER = {
  host: '127.0.0.1',
  port: 10000,
};

const KNOWN_DFPS = [
  { key: 'tokenlane', profileId: 'mx3_llm_generalist_tokenlane_ctx128_v1', label: 'Generalist Tokenlane 128', lane: 'llm_generalist_runtime' },
  { key: 'coder', profileId: 'mx3_code_expert_tokenlane_ctx256_v1', label: 'Coder Tokenlane 256', lane: 'llm_generalist_runtime' },
];

const PREVIEW_STATE = {
  live: false,
  planeStatus: 'Preview',
  planeNote: 'Inference plane preview',
  managerStatus: 'Preview',
  managerNote: `MX3 manager ${MX3_MANAGER.host}:${MX3_MANAGER.port}`,
  deviceStatus: 'MX3 preview',
  driverVersion: 'n/a',
  chipCount: 4,
  routeMode: 'preview',
  feederEnabled: false,
  feederAlignment: 'preview',
  feederLane: 'llm_generalist_runtime',
  feederTargetDfpPath: null,
  feederActiveDfpPath: null,
  utilizationPct: null,
  throughputPerMin: null,
  tempC: null,
  thermalSource: 'preview',
  thermalAvailable: false,
  thermalAgeS: null,
  thermalStale: false,
  responseMs: null,
  tpk: null,
  estimatedSavings: null,
  responseLabel: 'Preview runtime latency',
  temperatureMonitored: false,
  requestCount: null,
  runtimePolicy: 'unknown',
  windowsLabel: 'unknown',
  runtimeSummary: [
    'Selected DFP: Generalist Tokenlane 128',
    'Feeder state: standby',
  ],
  activePath: [
    'Inference: 127.0.0.1:9000/v1',
    'Embeddings: 127.0.0.1:2236/v1',
    'Telemetry: 127.0.0.1:9000',
    'Feeder: standby',
  ],
  dfpOptions: KNOWN_DFPS.map((item) => ({ ...item, path: null, available: false })),
};

const history = { latency: [], thermal: [] };
const realtimeWindow = { latency: [], throughput: [], tpk: [] };
let runtimeState = PREVIEW_STATE;
let importedDfps = loadJsonStorage('mx3PublicShim.importedDfps', []);
let selectedDfpKey = loadTextStorage('mx3PublicShim.selectedDfp', 'tokenlane');
let lastGoodPlane = loadTextStorage('mx3PublicShim.lastGoodPlane', '127.0.0.1:9000');
let refreshInFlight = false;
let dfpCatalogCache = null;
const REQUEST_TIMEOUT_MS = 4000;
const AUTO_REFRESH_INTERVAL_MS = 3000;
const REALTIME_WINDOW_LIMIT = 24;
let autoRefreshTimer = 0;
let lastRealtimeSampleKey = '';

function loadJsonStorage(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallbackValue;
    return Array.isArray(fallbackValue) ? (Array.isArray(parsed) ? parsed : fallbackValue) : parsed;
  } catch {
    return fallbackValue;
  }
}

function loadTextStorage(key, fallbackValue) {
  try {
    return window.localStorage.getItem(key) || fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveJsonStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function saveTextStorage(key, value) {
  window.localStorage.setItem(key, value);
}

function shortEndpoint(value) {
  return String(value || '').replace(/^https?:\/\//, '');
}

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function formatMetric(value, suffix = '') {
  return isFiniteNumber(value) ? `${Number(value).toFixed(2)}${suffix}` : 'n/a';
}

function formatCompactNumber(value) {
  return isFiniteNumber(value)
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value))
    : 'n/a';
}

function formatCurrency(value) {
  return isFiniteNumber(value)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value))
    : 'n/a';
}

function coalesceNumber(...values) {
  for (const value of values) {
    if (isFiniteNumber(value)) return Number(value);
  }
  return null;
}

function pushRealtimeSample(bucket, value, limit = REALTIME_WINDOW_LIMIT) {
  if (!Object.prototype.hasOwnProperty.call(realtimeWindow, bucket)) {
    return;
  }
  if (!isFiniteNumber(value) || Number(value) <= 0) {
    return;
  }
  realtimeWindow[bucket] = [...realtimeWindow[bucket], Number(value)].slice(-limit);
}

function averageRealtimeSample(bucket, sampleCount = 6) {
  const values = (realtimeWindow[bucket] || [])
    .filter((value) => isFiniteNumber(value) && Number(value) > 0)
    .slice(-sampleCount);
  if (!values.length) {
    return null;
  }
  return values.reduce((total, value) => total + Number(value), 0) / values.length;
}

function computeSavingsEstimate(accounting) {
  const localFullyLoaded = coalesceNumber(
    accounting?.local_fully_loaded_cost,
    accounting?.localFullyLoadedCost,
    accounting?.verified_local_fully_loaded_cost,
    accounting?.verifiedLocalFullyLoadedCost,
  );
  const localMarginal = coalesceNumber(
    accounting?.local_marginal_cost,
    accounting?.localMarginalCost,
    accounting?.verified_local_marginal_cost,
    accounting?.verifiedLocalMarginalCost,
  );
  const localCost = localFullyLoaded ?? localMarginal;

  const cloudEquivalent = coalesceNumber(accounting?.cloud_equivalent_cost, accounting?.cloudEquivalentCost);
  const cloudPreview = coalesceNumber(
    accounting?.benchmark_api_equivalent_cost,
    accounting?.benchmarkApiEquivalentCost,
    accounting?.displacement_value_preview,
    accounting?.displacementValuePreview,
  );

  const cloudCost = cloudEquivalent ?? cloudPreview;
  const savings = cloudCost != null && localCost != null ? cloudCost - localCost : null;
  const basis = cloudEquivalent != null ? 'cloud comparator' : (cloudPreview != null ? 'cloud estimate (preview)' : 'unavailable');
  const localBasis = localFullyLoaded != null ? 'local fully-loaded' : (localMarginal != null ? 'local marginal' : 'local unavailable');
  return { cloudCost, localCost, savings, basis, localBasis };
}

function basename(value) {
  return String(value || '').split(/[\\/]/).pop() || 'n/a';
}

function isValidDfpPath(value) {
  const text = String(value || '').trim();
  return Boolean(text) && /\.dfp$/i.test(text) && !text.toLowerCase().includes('udriver.dll');
}

function resolveRuntimeDfpPath(selected, state) {
  const candidate =
    String(selected?.path || '').trim()
    || String(state?.feederActiveDfpPath || '').trim()
    || String(state?.feederTargetDfpPath || '').trim();
  return isValidDfpPath(candidate) ? candidate : null;
}

function uniqueById(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const id = String(row?.id || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
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

async function loadOptionalJson(url, fallbackValue = null, timeoutMs = REQUEST_TIMEOUT_MS) {
  try {
    return await loadJson(url, timeoutMs);
  } catch {
    return fallbackValue;
  }
}

async function ensureDfpCatalog(force = false) {
  if (!force && dfpCatalogCache) {
    return dfpCatalogCache;
  }
  dfpCatalogCache = await loadOptionalJson(ENDPOINTS.dfpCatalog, dfpCatalogCache);
  return dfpCatalogCache;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const detail = payload?.detail || payload?.message || response.statusText;
    throw new Error(`${url} -> ${response.status} ${detail}`);
  }
  return payload;
}

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

function deriveStatusTone(kind, value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return 'neutral';
  if (kind === 'lmstudio') {
    return text.includes('connected') ? 'good' : text.includes('error') || text.includes('fail') ? 'error' : 'warn';
  }
  if (kind === 'device') {
    return text.includes('detected') ? 'good' : text.includes('unavailable') ? 'error' : 'warn';
  }
  if (kind === 'chat') {
    return text.includes('no loaded model') ? 'warn' : 'active';
  }
  if (kind === 'feeder') {
    return text.includes('enabled') ? 'good' : text.includes('disabled') ? 'warn' : 'active';
  }
  return 'neutral';
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

function renderStatus(text) {
  const node = document.querySelector('#control-status');
  if (node) node.textContent = text;
}

async function copyText(value, label) {
  await navigator.clipboard.writeText(String(value || ''));
  renderStatus(`${label} copied.`);
}

function sparklinePoints(values, width = 220, height = 56) {
  const rows = Array.isArray(values) ? values.filter((value) => isFiniteNumber(value)) : [];
  if (!rows.length) return '';
  if (rows.length === 1) {
    const y = height / 2;
    return `0,${y} ${width},${y}`;
  }
  const min = Math.min(...rows);
  const max = Math.max(...rows);
  const range = Math.max(max - min, 1);
  const step = width / Math.max(rows.length - 1, 1);
  return rows.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function pushHistory(key, value) {
  if (!isFiniteNumber(value)) return;
  history[key].push(Number(value));
  if (history[key].length > 36) {
    history[key] = history[key].slice(history[key].length - 36);
  }
}

function renderGraph(selector, key) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute('points', sparklinePoints(history[key]));
}

function normalizeChatOptions(modelState, lmModels) {
  const hostedCandidates = [];
  for (const row of modelState?.projected_hosted_models || []) hostedCandidates.push(row);
  for (const row of modelState?.hosted_candidates || []) hostedCandidates.push(row);
  const chatish = hostedCandidates.filter((row) => {
    const capability = String(row?.capability || '').toLowerCase();
    const caps = Array.isArray(row?.capabilities) ? row.capabilities.map((item) => String(item).toLowerCase()) : [];
    return capability !== 'embedding' && !caps.includes('embeddings');
  }).map((row) => ({ id: row.id, label: row.display_name || row.id }));

  const lmRows = Array.isArray(lmModels?.data) ? lmModels.data : [];
  const lmFallback = lmRows
    .map((row) => String(row?.id || '').trim())
    .filter(Boolean)
    .filter((id) => !id.toLowerCase().includes('embedding'))
    .map((id) => ({ id, label: id }));

  return uniqueById([...chatish, ...lmFallback]);
}

function normalizeEmbedOptions(modelState, lmModels) {
  const rows = [];
  const embedTruthRows = modelState?.embedding_truth?.text_embedding_available_models || [];
  const surfaceRows = modelState?.surface_truth?.lmstudio_embed?.available_embedding_models || [];
  for (const row of embedTruthRows) rows.push(row);
  for (const row of surfaceRows) rows.push(row);

  const normalized = rows.map((row) => ({ id: row.id, label: row.display_name || row.id }));
  const lmFallback = (Array.isArray(lmModels?.data) ? lmModels.data : [])
    .map((row) => String(row?.id || '').trim())
    .filter((id) => id.toLowerCase().includes('embedding'))
    .map((id) => ({ id, label: id }));

  return uniqueById([...normalized, ...lmFallback]);
}

function normalizeDfpOptions(entries) {
  const mapped = KNOWN_DFPS.map((item) => {
    const match = (entries || []).find((entry) => String(entry?.profile_id || '') === item.profileId);
    return {
      key: item.key,
      label: item.label,
      profileId: item.profileId,
      lane: match?.lane || item.lane,
      path: match?.path || null,
      available: Boolean(match?.path),
      source: match ? 'catalog' : 'expected',
    };
  });
  return [...mapped, ...importedDfps];
}

function getSelectedDfp(state = runtimeState) {
  const options = state?.dfpOptions?.length ? state.dfpOptions : PREVIEW_STATE.dfpOptions;
  return options.find((item) => item.key === selectedDfpKey) || options[0];
}

async function resolveSelectedDfpLive(state = runtimeState) {
  let selected = getSelectedDfp(state);
  if (selected?.path) {
    return selected;
  }
  await ensureDfpCatalog(false);
  const refreshedState = {
    ...state,
    dfpOptions: normalizeDfpOptions(dfpCatalogCache?.entries || []),
  };
  renderState(refreshedState);
  return getSelectedDfp(refreshedState);
}

function renderSelectOptions(selector, options, selectedValue) {
  const node = document.querySelector(selector);
  if (!node) return;
  node.innerHTML = '';
  for (const optionRow of options) {
    const option = document.createElement('option');
    option.value = optionRow.id || optionRow.key;
    option.textContent = optionRow.label || optionRow.id || optionRow.key;
    if ((optionRow.id || optionRow.key) === selectedValue) {
      option.selected = true;
    }
    node.appendChild(option);
  }
}

function renderDfpSelect(options) {
  const node = document.querySelector('#dfp-select');
  if (!node) return;
  node.innerHTML = '';
  for (const optionRow of options) {
    const option = document.createElement('option');
    option.value = optionRow.key;
    option.textContent = optionRow.available ? optionRow.label : `${optionRow.label} (path pending)`;
    if (optionRow.key === selectedDfpKey) option.selected = true;
    node.appendChild(option);
  }
}

function summarizeModels(loadedRows, loadedModel, embeddingModel) {
  const allIds = (loadedRows || []).map((row) => String(row?.id || '').trim()).filter(Boolean);
  const ordered = [];
  if (loadedModel) ordered.push(`Chat: ${loadedModel}`);
  if (embeddingModel && embeddingModel !== loadedModel) ordered.push(`Embeddings: ${embeddingModel}`);
  for (const id of allIds) {
    if (!ordered.some((line) => line.includes(id))) {
      ordered.push(id);
    }
  }
  if (ordered.length > 8) {
    return [...ordered.slice(0, 8), `+${ordered.length - 8} more`];
  }
  return ordered.length ? ordered : ['No models visible'];
}

function buildStateFromLive(health, telemetryReport, modelState, feederConfig, dfpCatalog) {
  const healthTelemetry = health?.telemetry || {};
  const reportTelemetry = telemetryReport?.telemetry || {};
  const thermalReport = reportTelemetry?.thermal || telemetryReport?.thermal || {};
  const mx3Probe = reportTelemetry?.mx3_probe || healthTelemetry.mx3_probe || {};
  const mx3Runtime = reportTelemetry?.mx3_runtime || healthTelemetry.mx3_runtime || {};
  const serving = reportTelemetry.serving_request || telemetryReport?.serving_request || healthTelemetry.serving_request || {};
  const embedTruth = modelState?.surface_truth?.lmstudio_embed || {};
  const dfpOptions = normalizeDfpOptions(dfpCatalog?.entries || []);
  const tempC = isFiniteNumber(thermalReport.temp_c)
    ? thermalReport.temp_c
    : (isFiniteNumber(healthTelemetry?.thermal?.temp_c) ? healthTelemetry.thermal.temp_c : null);
  const thermalSource = thermalReport.temp_source
    || healthTelemetry?.thermal?.temp_source
    || (isFiniteNumber(tempC) ? 'telemetry' : 'unavailable');
  const thermalAgeS = isFiniteNumber(thermalReport.temp_age_s)
    ? thermalReport.temp_age_s
    : (isFiniteNumber(healthTelemetry?.thermal?.temp_age_s) ? healthTelemetry.thermal.temp_age_s : null);
  const thermalStale = Boolean(thermalReport.temp_stale ?? healthTelemetry?.thermal?.temp_stale);
  const thermalAvailable = Boolean(thermalReport.available ?? isFiniteNumber(tempC));
  const temperatureMonitored = Boolean(thermalReport.monitoring_active ?? thermalAvailable);
  const avgLatencyMs = isFiniteNumber(reportTelemetry?.avg_latency_ms)
    ? reportTelemetry.avg_latency_ms
    : (isFiniteNumber(telemetryReport?.avg_latency_ms)
        ? telemetryReport.avg_latency_ms
        : (isFiniteNumber(healthTelemetry.avg_latency_ms) ? healthTelemetry.avg_latency_ms : null));
  const latestResponseMs = isFiniteNumber(serving.total_response_ms)
    ? serving.total_response_ms
    : (isFiniteNumber(reportTelemetry?.runtime_step?.latency_ms) ? reportTelemetry.runtime_step.latency_ms : null);
  const responseMs = avgLatencyMs ?? latestResponseMs;
  const responseLabel = isFiniteNumber(avgLatencyMs)
    ? 'Rolling average latency'
    : (isFiniteNumber(latestResponseMs) ? 'Latest request latency' : 'Runtime latency');
  const throughputPerMin = isFiniteNumber(healthTelemetry.throughput_per_min) ? healthTelemetry.throughput_per_min : null;
  const requestCount = isFiniteNumber(telemetryReport?.requests?.total)
    ? telemetryReport.requests.total
    : (isFiniteNumber(healthTelemetry.request_records_count) ? healthTelemetry.request_records_count : null);
  const accounting = reportTelemetry?.accounting || telemetryReport?.accounting || {};
  const tpk = isFiniteNumber(reportTelemetry?.tpk)
    ? reportTelemetry.tpk
    : (isFiniteNumber(telemetryReport?.tpk) ? telemetryReport.tpk : null);
  const savingsEstimate = computeSavingsEstimate(accounting);
  const estimatedSavings = savingsEstimate.savings;
  const windowsExposure = telemetryReport?.platform_profile?.windows_exposure
    || reportTelemetry?.accounting?.platform_profile?.windows_exposure
    || healthTelemetry?.accounting_rate_card?.platform_profile?.windows_exposure
    || {};
  const feederEnabled = Boolean(feederConfig?.enabled);
  const feederAlignment = feederConfig?.feeder_runtime_alignment || modelState?.feeder?.feeder_runtime_alignment || modelState?.feeder?.status || 'unknown';
  const feederLane = feederConfig?.feeder_lane || modelState?.feeder?.lane || 'llm_generalist_runtime';
  const feederTargetDfpPath = feederConfig?.target_dfp_path || modelState?.feeder?.target_dfp_path || null;
  const feederActiveDfpPath = feederConfig?.active_dfp_path || modelState?.feeder?.active_dfp_path || null;
  const dfpMatch = dfpOptions.find((item) => item.path && feederTargetDfpPath && item.path === feederTargetDfpPath);
  const selectedDfpLabel = dfpMatch?.label || basename(feederTargetDfpPath) || getSelectedDfp({ dfpOptions }).label;
  const routeMode = telemetryReport?.routing?.mode || healthTelemetry?.lmstudio_routing?.mode || 'unknown';

  const planeOnline = Boolean(health?.ok || telemetryReport?.telemetry || modelState?.selected_model_id || feederConfig?.enabled);
  const deviceDetected = Boolean(mx3Probe.available || Number(mx3Probe.device_count || 0) > 0 || String(mx3Runtime?.last_provider || '').toLowerCase() === 'mx3');

  return {
    live: planeOnline,
    planeStatus: planeOnline ? 'Online' : 'Offline',
    planeNote: shortEndpoint('http://127.0.0.1:9000/v1'),
    managerStatus: deviceDetected ? 'Present' : 'Unknown',
    managerNote: `${MX3_MANAGER.host}:${MX3_MANAGER.port} (MXA Manager)`,
    deviceStatus: deviceDetected ? 'MX3 detected' : 'MX3 unavailable',
    driverVersion: mx3Probe.driver_version || 'unknown',
    chipCount: mx3Probe.chip_count || 0,
    routeMode,
    feederEnabled,
    feederAlignment,
    feederLane,
    feederTargetDfpPath,
    feederActiveDfpPath,
    utilizationPct: coalesceNumber(reportTelemetry?.utilization_pct, mx3Runtime?.utilization_pct),
    throughputPerMin,
    tempC,
    thermalSource,
    thermalAvailable,
    thermalAgeS,
    thermalStale,
    avgLatencyMs,
    latestResponseMs,
    responseMs,
    tpk,
    tpkState: String(reportTelemetry?.tpk_state || telemetryReport?.tpk_state || 'unknown'),
    estimatedSavings,
    estimatedCloudCost: savingsEstimate.cloudCost,
    estimatedLocalCost: savingsEstimate.localCost,
    savingsBasis: savingsEstimate.basis,
    savingsLocalBasis: savingsEstimate.localBasis,
    responseLabel,
    temperatureMonitored,
    requestCount,
    runtimePolicy: mx3Runtime.policy_mode || 'unknown',
    windowsLabel: windowsExposure.friendly_name || windowsExposure.pnp_class || windowsExposure.status || 'unknown',
    runtimeSummary: [
      `Selected DFP: ${selectedDfpLabel}`,
      `Feeder state: ${feederEnabled ? 'enabled' : 'disabled'} • ${feederAlignment}`,
      `Route mode: ${routeMode}`,
      `MX3 manager: ${MX3_MANAGER.host}:${MX3_MANAGER.port}`,
    ],
    activePath: [
      `Inference: ${shortEndpoint('http://127.0.0.1:9000/v1')}`,
      `Hosted: ${shortEndpoint('http://127.0.0.1:2337/v1')}`,
      `Embeddings: ${shortEndpoint(embedTruth.active_embedding_location || 'http://127.0.0.1:2236/v1')}`,
      `MX3 manager: ${MX3_MANAGER.host}:${MX3_MANAGER.port}`,
      `Telemetry: ${shortEndpoint('http://127.0.0.1:9000')}`,
      `Route mode: ${routeMode}`,
      `Feeder lane: ${feederLane}`,
      `Target DFP: ${selectedDfpLabel}`,
    ],
    dfpOptions,
  };
}

function renderState(state) {
  runtimeState = state;
  pushHistory('latency', state.responseMs);
  pushHistory('thermal', state.tempC);
  const realtimeSampleKey = [
    state.requestCount ?? 'n/a',
    state.latestResponseMs ?? state.responseMs ?? 'n/a',
    state.tpk ?? 'n/a',
    state.throughputPerMin ?? 'n/a',
  ].join('|');
  if (realtimeSampleKey !== lastRealtimeSampleKey) {
    lastRealtimeSampleKey = realtimeSampleKey;
    pushRealtimeSample('latency', isFiniteNumber(state.latestResponseMs) ? state.latestResponseMs : state.responseMs);
    pushRealtimeSample('throughput', state.throughputPerMin);
    pushRealtimeSample('tpk', state.tpk);
  }
  const smoothedLatencyMs = averageRealtimeSample('latency');
  const smoothedThroughputPerMin = averageRealtimeSample('throughput');
  const smoothedTpk = averageRealtimeSample('tpk');
  const liveWindowSampleCount = realtimeWindow.latency.length;
  const displayedLatencyMs = isFiniteNumber(smoothedLatencyMs) ? smoothedLatencyMs : state.responseMs;
  const displayedThroughputPerMin = isFiniteNumber(smoothedThroughputPerMin) ? smoothedThroughputPerMin : state.throughputPerMin;
  const displayedTpk = isFiniteNumber(smoothedTpk) ? smoothedTpk : state.tpk;

  if (!state.dfpOptions.some((row) => row.key === selectedDfpKey)) {
    selectedDfpKey = state.dfpOptions[0]?.key || 'tokenlane';
    saveTextStorage('mx3PublicShim.selectedDfp', selectedDfpKey);
  }

  renderDfpSelect(state.dfpOptions);

  setText('#plane-status', state.planeStatus || 'Unknown');
  setText('#plane-note', state.planeNote || `API ${lastGoodPlane}`);
  setStatusTone('#plane-status', deriveStatusTone('plane', state.planeStatus || 'Unknown'));

  setText('#manager-status', state.managerStatus || 'Unknown');
  setText('#manager-note', state.managerNote || `MX3 manager ${MX3_MANAGER.host}:${MX3_MANAGER.port}`);
  setStatusTone('#manager-status', deriveStatusTone('manager', state.managerStatus || 'Unknown'));
  setText('#device-status', state.deviceStatus);
  setText('#device-note', `Driver ${state.driverVersion} • ${state.chipCount} chip${state.chipCount === 1 ? '' : 's'}`);
  setStatusTone('#device-status', deriveStatusTone('device', state.deviceStatus));
  // No LM model ownership here. This surface is DFP/feeder + device boundary + telemetry.
  setText('#feeder-status', state.feederEnabled ? 'Enabled' : 'Disabled');
  setText('#feeder-note', `${getSelectedDfp(state).label} • ${state.feederAlignment} • lane ${state.feederLane || 'unknown'}`);
  setStatusTone('#feeder-status', deriveStatusTone('feeder', state.feederEnabled ? 'Enabled' : 'Disabled'));

  setText('#metric-utilization', formatMetric(state.utilizationPct, '%'));
  setText('#metric-driver', state.driverVersion || 'unknown');
  setText('#metric-chips', String(state.chipCount || 0));
  setText('#metric-temperature', isFiniteNumber(state.tempC) ? `${Number(state.tempC).toFixed(1)} C` : 'No sample yet');
  setText('#metric-throughput', isFiniteNumber(displayedThroughputPerMin) ? `${Number(displayedThroughputPerMin).toFixed(2)} req/min` : 'n/a');
  setText('#metric-requests', isFiniteNumber(state.requestCount) ? `${state.requestCount}` : 'n/a');

  setText('#runtime-value', isFiniteNumber(displayedLatencyMs) ? `${Number(displayedLatencyMs).toFixed(2)} ms` : 'No sample yet');
  setText(
    '#runtime-note',
    `${state.responseLabel} • ${state.runtimePolicy} • ${liveWindowSampleCount || 0} live samples • latest ${isFiniteNumber(state.latestResponseMs) ? `${Number(state.latestResponseMs).toFixed(2)} ms` : 'n/a'}`,
  );
  if (state.live && isFiniteNumber(state.tempC)) {
    const agePart = isFiniteNumber(state.thermalAgeS) ? ` • age ${Number(state.thermalAgeS).toFixed(1)} s` : '';
    const stalePart = state.thermalStale ? ' • stale' : '';
    setText('#thermal-value', `${Number(state.tempC).toFixed(1)} C`);
    setText('#thermal-note', `Source ${state.thermalSource}${agePart}${stalePart}`);
  } else if (state.live) {
    setText('#thermal-value', state.thermalAvailable ? 'No sample yet' : 'Unavailable');
    setText('#thermal-note', `${state.temperatureMonitored ? 'Sensor ready' : 'Sensor idle'} • source ${state.thermalSource || 'unknown'}`);
  } else {
    setText('#thermal-value', 'Preview');
    setText('#thermal-note', 'Preview surface');
  }
  setText(
    '#tpk-value',
    isFiniteNumber(displayedTpk) ? formatCompactNumber(displayedTpk) : (state.tpkState && state.tpkState !== 'unknown' ? state.tpkState : 'n/a'),
  );
  setText('#tpk-note', state.live ? `Real TPK state (from :9000) • ${liveWindowSampleCount || 0} live samples` : 'Preview TPK');
  setText('#savings-value', formatCurrency(state.estimatedSavings));
  if (state.live) {
    const parts = [];
    if (state.savingsBasis && state.savingsBasis !== 'unavailable') parts.push(state.savingsBasis);
    if (state.savingsLocalBasis && state.savingsLocalBasis !== 'local unavailable') parts.push(state.savingsLocalBasis);
    if (isFiniteNumber(state.estimatedCloudCost) && isFiniteNumber(state.estimatedLocalCost)) {
      parts.push(`${formatCurrency(state.estimatedCloudCost)} - ${formatCurrency(state.estimatedLocalCost)}`);
    }
    setText('#savings-note', parts.length ? parts.join(' • ') : 'Cloud estimate unavailable');
  } else {
    setText('#savings-note', 'Preview savings');
  }

  // No LM Studio inventory surfacing in the public control center.
  setText('#routing-card-title', `${state.routeMode} • ${state.feederEnabled ? 'feeder enabled' : 'feeder idle'}`);

  renderList('#runtime-summary-list', state.runtimeSummary);
  // (intentionally no LM Studio model list)
  renderList('#active-path-list', [
    ...state.activePath,
    `Windows label: ${state.windowsLabel}`,
    `Active DFP: ${basename(state.feederActiveDfpPath)}`,
    `Temperature source: ${state.thermalSource || 'unknown'}`,
  ]);
  renderGraph('#latency-graph', 'latency');
  renderGraph('#thermal-graph', 'thermal');
  scheduleViewportFit();
}

let fitFrame = 0;

function applyViewportFit() {
  const shell = document.querySelector('.shell');
  if (!shell) return;
  shell.style.zoom = '1';
  const availableWidth = Math.max(360, window.innerWidth - 12);
  const availableHeight = Math.max(360, window.innerHeight - 12);
  const neededWidth = Math.max(shell.scrollWidth, shell.offsetWidth, 1);
  const neededHeight = Math.max(shell.scrollHeight, shell.offsetHeight, 1);
  const scale = Math.min(availableWidth / neededWidth, availableHeight / neededHeight, 1);
  shell.style.zoom = String(Math.max(0.42, scale));
}

function scheduleViewportFit() {
  if (fitFrame) cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(() => {
    fitFrame = 0;
    applyViewportFit();
  });
}

async function fetchState() {
  const health = await loadOptionalJson(ENDPOINTS.health, {}, 2000);
  const telemetryReport = await loadOptionalJson(ENDPOINTS.telemetryReport, {}, 3000);
  const modelState = await loadOptionalJson(ENDPOINTS.modelState, {}, 2500);
  const feederConfig = await loadOptionalJson(ENDPOINTS.feederConfig, {}, 2500);
  return buildStateFromLive(health, telemetryReport, modelState, feederConfig, dfpCatalogCache);
}

async function refreshState(options = {}) {
  const silent = Boolean(options?.silent);
  if (refreshInFlight) {
    return;
  }
  refreshInFlight = true;
  try {
    const state = await fetchState();
    renderState(state);
    if (!silent) {
      renderStatus(`Runtime refreshed. DFP ${getSelectedDfp(state).label}. Feeder ${state.feederEnabled ? 'enabled' : 'disabled'}.`);
    }
  } catch (error) {
    if (runtimeState?.live) {
      renderState(runtimeState);
      if (!silent) {
        renderStatus(`Runtime refreshed with degraded telemetry. ${String(error)}`);
      }
      return;
    }
    renderState(PREVIEW_STATE);
    if (!silent) {
      renderStatus(`Preview fallback. ${String(error)}`);
    }
  } finally {
    refreshInFlight = false;
  }
}

function startAutoRefresh() {
  if (autoRefreshTimer) {
    return;
  }
  autoRefreshTimer = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }
    void refreshState({ silent: true });
  }, AUTO_REFRESH_INTERVAL_MS);
}

async function validateMx3Path() {
  try {
    const state = await fetchState();
    renderState(state);
    const problems = [];
    if (state.deviceStatus !== 'MX3 detected') problems.push('MX3 device is not reporting as detected');
    if (!getSelectedDfp(state)?.path) problems.push('no DFP path is selected yet');
    if (problems.length) {
      renderStatus(`Validation needs attention: ${problems.join(' | ')}`);
      return;
    }
    renderStatus(`MX3 validated. DFP ${getSelectedDfp(state).label}. Feeder ${state.feederEnabled ? 'enabled' : 'disabled'}.`);
  } catch (error) {
    renderStatus(`Validation failed: ${String(error)}`);
  }
}

// Public contract: model load/unload belongs to the user's model host (LM Studio, etc.).
async function loadChatModel() { renderStatus('Chat model load/unload is owned by your model host (e.g. LM Studio).'); }
async function unloadChatModel() { renderStatus('Chat model load/unload is owned by your model host (e.g. LM Studio).'); }
async function loadEmbedModel() { renderStatus('Embed model load/unload is owned by your model host (e.g. LM Studio).'); }
async function unloadEmbedModel() { renderStatus('Embed model load/unload is owned by your model host (e.g. LM Studio).'); }

async function loadSelectedDfpRuntime(selected, options = {}) {
  const initialSelected = selected && typeof selected === 'object' ? selected : getSelectedDfp(runtimeState);
  const dfp = initialSelected?.path ? initialSelected : await resolveSelectedDfpLive(runtimeState);
  const dfpPath = String(dfp?.path || '').trim();
  const lane = String(
    options?.lane || dfp?.lane || runtimeState.feederLane || 'llm_generalist_runtime',
  ).trim() || 'llm_generalist_runtime';
  if (!dfpPath) {
    throw new Error('Selected DFP has no runtime path yet.');
  }
  // Public contract: never bounce the live inference plane implicitly.
  // If an operator wants to unlock/reset, they must press the explicit Unlock MX3 control.
  if (options?.prepareStop === true) await postJson(ENDPOINTS.runtimePrepareStop, {});
  return postJson(ENDPOINTS.mx3LoadModel, { path: dfpPath, lane });
}

async function applyDfp() {
  const selected = await resolveSelectedDfpLive(runtimeState);
  if (!selected?.path) {
    renderStatus('Selected DFP has no runtime path yet. Import one or use a catalog-backed DFP.');
    return;
  }
  await loadSelectedDfpRuntime(selected, { prepareStop: false });
  await postJson(ENDPOINTS.feederConfig, {
    enabled: runtimeState.feederEnabled,
    require_mx3: true,
    prefer_mx3: true,
    feeder_lane: selected.lane || runtimeState.feederLane || 'llm_generalist_runtime',
    dfp_path: selected.path,
  });
  await refreshState();
  renderStatus(`DFP applied: ${selected.label}.`);
}

async function unlockMx3Hardware() {
  const response = await postJson(ENDPOINTS.runtimePrepareStop, {});
  await refreshState();
  const detail = String(response?.detail || 'hardware unlock requested');
  renderStatus(`MX3 unlock: ${detail}`);
}

async function startFeeder() {
  const selected = await resolveSelectedDfpLive(runtimeState);
  const resolvedDfpPath = resolveRuntimeDfpPath(selected, runtimeState);
  if (!resolvedDfpPath) {
    renderStatus('Feeder start blocked: no resolved DFP runtime path. Select a DFP that has a real .dfp path (catalog sync or import) or load one into the runtime first.');
    return;
  }
  // Do not implicitly bounce the runtime. If a DFP needs to be loaded, the operator should press Apply DFP.
  const body = {
    enabled: true,
    require_mx3: true,
    prefer_mx3: true,
    feeder_lane: selected?.lane || runtimeState.feederLane || 'llm_generalist_runtime',
  };
  body.dfp_path = resolvedDfpPath;
  await postJson(ENDPOINTS.feederConfig, body);
  await refreshState();
  renderStatus(`Feeder start requested${selected?.label ? ` with ${selected.label}` : ''}.`);
}

async function stopFeeder() {
  await postJson(ENDPOINTS.feederConfig, { enabled: false });
  await refreshState();
  renderStatus('Feeder stop requested.');
}

async function resetFeeder() {
  await postJson(ENDPOINTS.feederConfig, { reset: true });
  await refreshState();
  renderStatus('Feeder reset requested.');
}

function handleDfpSelectionChange(event) {
  selectedDfpKey = event.target.value;
  saveTextStorage('mx3PublicShim.selectedDfp', selectedDfpKey);
  renderState(runtimeState);
  renderStatus(`Selected DFP: ${getSelectedDfp(runtimeState).label}.`);
}

function handleDfpImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const key = `custom-${Date.now()}`;
  importedDfps.push({
    key,
    label: file.name,
    profileId: null,
    lane: 'llm_generalist_runtime',
    path: file.path || null,
    available: Boolean(file.path),
    source: 'imported',
  });
  saveJsonStorage('mx3PublicShim.importedDfps', importedDfps);
  selectedDfpKey = key;
  saveTextStorage('mx3PublicShim.selectedDfp', selectedDfpKey);
  renderState({ ...runtimeState, dfpOptions: normalizeDfpOptions([]) });
  renderStatus(`Imported DFP: ${file.name}.`);
  event.target.value = '';
}

function enforceDfpFeederOnlyUi() {
  // Public contract: this app must not perform LLM/embed model load/unload. LM Studio owns those controls.
  const selectors = [
    '#chat-model-select',
    '#embed-model-select',
    '#load-chat-btn',
    '#unload-chat-btn',
    '#load-embed-btn',
    '#unload-embed-btn',
  ];
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node) node.style.display = 'none';
  }
}

// Fail-closed stubs: even if legacy UI elements exist, this surface won't perform model-plane mutations.
function loadChatModel() { renderStatus('Chat model load/unload is owned by LM Studio.'); }
function unloadChatModel() { renderStatus('Chat model load/unload is owned by LM Studio.'); }
function loadEmbedModel() { renderStatus('Embedding model load/unload is owned by LM Studio.'); }
function unloadEmbedModel() { renderStatus('Embedding model load/unload is owned by LM Studio.'); }

function wireControls() {
  enforceDfpFeederOnlyUi();
  document.querySelector('#refresh-runtime-btn')?.addEventListener('click', () => refreshState().catch((error) => renderStatus(`Refresh failed: ${String(error)}`)));
  document.querySelector('#validate-mx3-btn')?.addEventListener('click', () => validateMx3Path().catch((error) => renderStatus(`Validation failed: ${String(error)}`)));
  document.querySelector('#dfp-select')?.addEventListener('change', handleDfpSelectionChange);
  document.querySelector('#apply-dfp-btn')?.addEventListener('click', () => applyDfp().catch((error) => renderStatus(`DFP apply failed: ${String(error)}`)));
  document.querySelector('#unlock-mx3-btn')?.addEventListener('click', () => unlockMx3Hardware().catch((error) => renderStatus(`MX3 unlock failed: ${String(error)}`)));
  document.querySelector('#start-feeder-btn')?.addEventListener('click', () => startFeeder().catch((error) => renderStatus(`Feeder start failed: ${String(error)}`)));
  document.querySelector('#stop-feeder-btn')?.addEventListener('click', () => stopFeeder().catch((error) => renderStatus(`Feeder stop failed: ${String(error)}`)));
  document.querySelector('#reset-feeder-btn')?.addEventListener('click', () => resetFeeder().catch((error) => renderStatus(`Feeder reset failed: ${String(error)}`)));
  document.querySelector('#import-dfp-btn')?.addEventListener('click', () => document.querySelector('#dfp-import-input')?.click());
  document.querySelector('#dfp-import-input')?.addEventListener('change', handleDfpImport);
  document.querySelectorAll('.copy-link-btn').forEach((button) => {
    button.addEventListener('click', () => {
      copyText(button.dataset.copy || '', button.dataset.copyLabel || 'Link').catch((error) => {
        renderStatus(`Copy failed: ${String(error)}`);
      });
    });
  });
}

wireControls();
window.addEventListener('resize', scheduleViewportFit);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    void refreshState({ silent: true });
  }
});
window.addEventListener('focus', () => {
  void refreshState({ silent: true });
});
window.addEventListener('load', () => {
  renderState(PREVIEW_STATE);
  renderStatus('Live auto-refresh active. Visible window polls MX3 telemetry every 3 seconds.');
  scheduleViewportFit();
  startAutoRefresh();
  void refreshState({ silent: true });
});
