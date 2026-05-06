import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("organizerAPI", {
  loadData: () => ipcRenderer.invoke("organizer:load-data"),
  saveData: (payload) => ipcRenderer.invoke("organizer:save-data", payload),
  resetData: (payload) => ipcRenderer.invoke("organizer:reset-data", payload),
  getPaths: () => ipcRenderer.invoke("organizer:get-paths"),
  pickPdfFile: () => ipcRenderer.invoke("organizer:pick-pdf"),
});
