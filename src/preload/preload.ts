import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  toggleChat: (show: boolean) => ipcRenderer.send('toggle-chat', show)
});
