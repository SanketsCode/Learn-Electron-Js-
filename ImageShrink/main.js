// const { app, BrowserWindow, Menu, globalShortcut } = require("electron");

// //Set env
// process.env.NODE_ENV = "development";

// const isDev = process.env.NODE_ENV !== "production" ? true : false;
// const isMac = process.platform === "darwin";

// // console.log(process.platform == "darwin");
// // console.log(isMac);

// let mainWindow;
// let aboutWindow;

// function createMainWindow() {
//   mainWindow = new BrowserWindow({
//     title: "imageshrink",
//     width: 500,
//     height: 500,
//     icon: "./assets/icons/Icon_256x256.png",
//     backgroundColor: "white",
//     resizable: isDev ? true : false,
//   });

//   //   mainWindow.loadURL(`file://${__dirname}/app/index.html`);
//   mainWindow.loadFile("./app/index.html");
// }

// function createAboutWindow() {
//   aboutWindow = new BrowserWindow({
//     title: "About Window",
//     width: 300,
//     height: 300,
//     icon: "./assets/icons/Icon_256x256.png",
//     resizable: false,
//   });

//   aboutWindow.loadFile("./app/about.html");
// }

// const menu = [
//   ...(isMac
//     ? [
//         {
//           label: app.name,
//           submenu: [{ label: "About", click: createAboutWindow }],
//         },
//       ]
//     : []),

//   // {
//   //   label: "File",
//   //   submenu: [
//   //     {
//   //       label: "Quit",
//   //       // accelerator: isMac ? "Command+Q" : "Ctrl+Q",
//   //       accelerator: "CmdOrCtrl+W",
//   //       click: () => app.quit(),
//   //     },
//   //   ],
//   // },
//   {
//     role: "fileMenu",
//   },
//   ...(!isMac ? [{ label: "help", click: createAboutWindow }] : []),
//   ...(isDev
//     ? [
//         {
//           label: "Developer",
//           submenu: [
//             {
//               role: "reload",
//             },
//             { role: "forcereload" },
//             { type: "separator" },
//             { role: "toggledevtools" },
//           ],
//         },
//       ]
//     : []),
// ];

// app.on("ready", () => {
//   createMainWindow();
//   //Using for going through menu
//   const mainMenu = Menu.buildFromTemplate(menu);
//   Menu.setApplicationMenu(mainMenu);

//   //global shortcuts
//   // globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
//   // globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
//   //   mainWindow.toggleDevTools()
//   // );

//   mainWindow.on("ready", () => (mainWindow = null));
// });

// app.on("window-all-closed", () => {
//   if (!isMac) {
//     app.quit();
//   }
// });

// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// app.allowRenderProcessReuse = true;


const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('./app/index.html')

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})