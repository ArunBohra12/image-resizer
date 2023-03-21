const os = require('os');
const path = require('path');

const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

// Expose the `os` module methods to renderer
contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

// Expose the `path` module methods to renderer
contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

// Expose the `toastify` methods to renderer
contextBridge.exposeInMainWorld('Toastify', {
  toast: options => Toastify(options).showToast(),
});

// Expose `ipcRenderer` methods to renderer
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
