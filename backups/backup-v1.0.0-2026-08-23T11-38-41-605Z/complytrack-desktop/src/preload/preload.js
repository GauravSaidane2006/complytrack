const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  server: {
    getStatus: () => ipcRenderer.invoke('server:getStatus'),
    restart: () => ipcRenderer.invoke('server:restart')
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize'),
    isMaximized: () => ipcRenderer.invoke('app:isMaximized'),
    openDevTools: () => ipcRenderer.invoke('app:openDevTools')
  },
  onServerStatusChange: (callback) => {
    ipcRenderer.on('server-status', (_, data) => callback(data));
    return () => ipcRenderer.off('server-status', callback);
  }
});