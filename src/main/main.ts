import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 120,
    height: 120,
    x: width - 140,
    y: 40,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // always load from file in production build
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // handle chat toggle
  ipcMain.on('toggle-chat', (_event, show: boolean) => {
    if (!mainWindow) return;
    
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    
    if (show) {
      // expand to chat mode - taller to fit emoji + chat
      mainWindow.setSize(200, 550);
      mainWindow.setPosition(screenWidth - 220, 40);
    } else {
      // collapse to emoji
      mainWindow.setSize(120, 120);
      mainWindow.setPosition(screenWidth - 140, 40);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
