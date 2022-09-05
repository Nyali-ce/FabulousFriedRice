// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

function createWindow() {
  const mainWindowMenu = new Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        {
          label: 'Full Screen',
          accelerator: 'F11',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen())
          }
        },
      ]
    },
    {
      label: '🍆🍑😏🤨😳💅',
      submenu: [
        {
          label: 'full mega hacker mode',
          // accelerator: 'ctrl+shift+alt+p+o+u+k+i',
          accelerator: 'f12',
          click() {
            mainWindow.webContents.openDevTools()
          }
        }]
    }
  ])

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    titleBarOverlay: true,
    titleBarStyle: 'hiddenInset',

    minWidth: 800,
    minHeight: 600,
    width: 1280,
    height: 720,
    maxHeight: 1080,
    maxWidth: 1920,

    icon: path.join(__dirname, 'assets/icons/64x64.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
  })

  Menu.setApplicationMenu(mainWindowMenu)

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// My code
app.setUserTasks([
  {
    program: process.execPath,
    arguments: '',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'dm alice and tell her to go to bed',
    description: 'please :pensive:'
  }
])