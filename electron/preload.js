const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('mx3PublicShimDesktop', Object.freeze({
  shell: 'electron',
}));
