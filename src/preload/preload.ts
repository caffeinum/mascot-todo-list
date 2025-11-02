import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // add ipc handlers here later
});
