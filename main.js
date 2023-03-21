const path = require('path');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, './.env') });

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const resizeImage = require('./utils/image');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

// Create the main window for the application
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Keep dev tools open if in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
            },
          ],
        },
      ]
    : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: function () {
          app.quit();
        },
        accelerator: 'CmdorCtrl+W',
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

// Create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    width: 300,
    height: 300,
  });

  // Keep dev tools open if in development mode
  if (isDev) {
    aboutWindow.webContents.openDevTools();
  }

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// Run when app is ready
app.whenReady().then(function () {
  createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove mainWindow from memory on close
  mainWindow.on('closed', function () {
    mainWindow = undefined;
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Respond to ipc renderer resize
ipcMain.on('image:resize', async function (event, options) {
  const dest = path.join(os.homedir(), 'image-resizer');

  options.dest = dest;
  const resizeImageStatus = await resizeImage(options);

  if (!resizeImageStatus) {
    mainWindow.webContents.send('image-resize:failed');
    return;
  }

  mainWindow.webContents.send('image-resize:success');
  shell.openPath(dest);
});

app.on('window-all-closed', function () {
  if (!isMac) {
    app.quit();
  }
});
