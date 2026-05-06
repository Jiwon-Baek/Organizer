function now() {
  return new Date().toISOString();
}

const browserStorageKey = "organizer.web.appData.v1";
const browserPdfDbName = "organizer-web-pdfs";
const browserPdfStoreName = "pdfs";

export const seedData = {
  version: "0.2.0",
  settings: {
    language: "ko",
    theme: "light",
    storage_mode: "json_file",
    ui_font_preset: "regular",
  },
  notebooks: [],
};

export function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

export function normalizeDataShape(rawData) {
  const base = cloneSeed();
  const data = rawData && typeof rawData === "object" ? rawData : {};

  return {
    ...base,
    ...data,
    settings: {
      ...base.settings,
      ...(data.settings || {}),
      storage_mode: "json_file",
    },
    notebooks: Array.isArray(data.notebooks) ? data.notebooks : base.notebooks,
  };
}

export async function loadAppData() {
  if (!window.organizerAPI?.loadData) {
    try {
      const stored = window.localStorage?.getItem(browserStorageKey);
      return normalizeDataShape(stored ? JSON.parse(stored) : cloneSeed());
    } catch {
      return normalizeDataShape(cloneSeed());
    }
  }

  const loaded = await window.organizerAPI.loadData();
  return normalizeDataShape(loaded);
}

export async function saveAppData(data) {
  const payload = normalizeDataShape({
    ...data,
    last_saved_at: now(),
  });

  if (window.organizerAPI?.saveData) {
    await window.organizerAPI.saveData(payload);
  } else {
    window.localStorage?.setItem(browserStorageKey, JSON.stringify(payload));
  }

  return payload;
}

export async function resetAppData() {
  const reset = normalizeDataShape(cloneSeed());
  if (window.organizerAPI?.resetData) {
    await window.organizerAPI.resetData(reset);
  } else {
    window.localStorage?.setItem(browserStorageKey, JSON.stringify(reset));
    await clearBrowserPdfs();
  }
  return reset;
}

export function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function timestamp() {
  return now();
}

function openBrowserPdfDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(browserPdfDbName, 1);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(browserPdfStoreName)) {
        db.createObjectStore(browserPdfStoreName, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function runPdfStore(mode, callback) {
  return openBrowserPdfDb().then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(browserPdfStoreName, mode);
      const store = tx.objectStore(browserPdfStoreName);
      let requestResult;

      try {
        requestResult = callback(store);
      } catch (error) {
        db.close();
        reject(error);
        return;
      }

      tx.addEventListener("complete", () => {
        db.close();
        resolve(requestResult?.result);
      });
      tx.addEventListener("error", () => {
        db.close();
        reject(tx.error);
      });
      tx.addEventListener("abort", () => {
        db.close();
        reject(tx.error || new Error("PDF storage transaction was aborted."));
      });
    }),
  );
}

export function isBrowserPdfPath(path) {
  return typeof path === "string" && path.startsWith("indexeddb://pdf/");
}

export async function saveBrowserPdf(pdfId, file) {
  if (window.organizerAPI?.saveData) {
    return null;
  }

  await runPdfStore("readwrite", (store) =>
    store.put({
      id: pdfId,
      blob: file,
      name: file.name,
      type: file.type || "application/pdf",
      updated_at: now(),
    }),
  );
  return `indexeddb://pdf/${pdfId}`;
}

export async function resolveBrowserPdfUrl(path) {
  if (!isBrowserPdfPath(path)) {
    return path;
  }

  const id = path.replace("indexeddb://pdf/", "");
  const record = await runPdfStore("readonly", (store) => store.get(id));
  if (!record?.blob) {
    throw new Error("PDF 파일을 브라우저 저장소에서 찾을 수 없습니다.");
  }

  return URL.createObjectURL(record.blob);
}

async function clearBrowserPdfs() {
  try {
    await runPdfStore("readwrite", (store) => store.clear());
  } catch {
    // Reset should still succeed even if browser PDF storage is unavailable.
  }
}
