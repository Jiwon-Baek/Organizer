import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAppRootDir() {
  return app.isPackaged ? process.resourcesPath : path.resolve(__dirname, "..");
}

function getWritableBaseDir() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, "OrganizerData");
  }

  return path.join(app.getPath("userData"), "OrganizerData");
}

function getStoragePaths() {
  const appRootDir = getAppRootDir();
  const writableBaseDir = getWritableBaseDir();

  return {
    appRootDir,
    writableBaseDir,
    dataDir: path.join(writableBaseDir, "data"),
    backupDir: path.join(writableBaseDir, "data", "backups"),
    dataFilePath: path.join(writableBaseDir, "data", "app_data.json"),
    indexPath: path.join(appRootDir, "index.html"),
  };
}

function showStartupError(title, error) {
  const message = error instanceof Error ? `${error.message}\n\n${error.stack || ""}` : String(error);
  dialog.showErrorBox(title, message);
}

function createWindow() {
  const { indexPath } = getStoragePaths();
  const win = new BrowserWindow({
    width: 1540,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#f5f1e8",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(indexPath).catch((error) => {
    showStartupError("Organizer failed to load the main window", error);
  });
}

async function ensureDataLayout() {
  const { dataDir, backupDir } = getStoragePaths();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(backupDir, { recursive: true });
}

async function backupCurrentDataIfExists() {
  const { dataFilePath, backupDir } = getStoragePaths();
  try {
    const current = await fs.readFile(dataFilePath, "utf8");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `app_data_${stamp}.json`);
    await fs.writeFile(backupPath, current, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function readDataFile() {
  const { dataFilePath } = getStoragePaths();
  await ensureDataLayout();
  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function writeDataFile(payload) {
  const { dataFilePath } = getStoragePaths();
  await ensureDataLayout();
  await backupCurrentDataIfExists();
  const formatted = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(dataFilePath, formatted, "utf8");
  return {
    saved: true,
    path: dataFilePath,
  };
}

ipcMain.handle("organizer:load-data", async () => readDataFile());
ipcMain.handle("organizer:save-data", async (_event, payload) => writeDataFile(payload));
ipcMain.handle("organizer:reset-data", async (_event, payload) => writeDataFile(payload));
ipcMain.handle("organizer:pick-pdf", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { filePaths, canceled } = await dialog.showOpenDialog(win, {
    title: "PDF 파일 선택",
    properties: ["openFile"],
    filters: [{ name: "PDF 파일", extensions: ["pdf"] }],
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

ipcMain.handle("organizer:get-paths", async () => {
  const { appRootDir, dataFilePath, backupDir, writableBaseDir } = getStoragePaths();
  return {
    rootDir: appRootDir,
    dataFilePath,
    backupDir,
    writableBaseDir,
  };
});

process.on("uncaughtException", (error) => {
  showStartupError("Organizer crashed with an uncaught exception", error);
});

process.on("unhandledRejection", (error) => {
  showStartupError("Organizer crashed with an unhandled promise rejection", error);
});

app.whenReady().then(async () => {
  try {
    await ensureDataLayout();
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    showStartupError("Organizer failed during startup", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
