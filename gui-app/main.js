const {app, BrowserWindow, ipcMain, powerSaveBlocker} = require('electron')
// const { powerSaveBlocker } = require('electron');
// const powerSaveBlocker = app.remote.powerSaveBlocker;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({ 
      frame: false, 
      titleBarStyle: 'hidden',
      // fullscreen: true,
      kiosk: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
  })
  // mainWindow.webContents.openDevTools()

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  mainWindow.webContents.on('dom-ready', (event)=> {
    let css = '* { cursor: none !important; }';
    mainWindow.webContents.insertCSS(css);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  powerMonitor.on("lock-screen", () => {
    powerSaveBlocker.start("prevent-display-sleep");
  });
  powerMonitor.on("suspend", () => {
    powerSaveBlocker.start("prevent-app-suspension");
  });
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('terminate-app', () => {
  app.quit();
});