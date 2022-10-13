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
        }, {
          label: 'Reload',
          accelerator: 'F5',
          click() {
            mainWindow.reload()
          }
        },
      ]
    },
    {
      label: 'I want boobies 🍆🍑😏💅',
      submenu: [
        {
          label: 'full mega hacker mode',
          accelerator: 'f12',
          click() {
            mainWindow.webContents.openDevTools()
          }
        }]
    }
  ])

  const mainWindow = new BrowserWindow({
    titleBarOverlay: true,
    titleBarStyle: 'hiddenInset',

    minWidth: 800,
    minHeight: 600,
    width: 1280,
    height: 720,

    icon: path.join(__dirname, 'assets/icons/64x64.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
  })

  Menu.setApplicationMenu(mainWindowMenu)

  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

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