const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");

const path = require("path");
const os = require("os");
// const imagemin = require('imagemin');
// const imageminMozjpeg = require('imagemin-mozjpeg');
// const imageminPngQuant = require('imagemin-pngquant');
// const imageminJpegtran = require('imagemin-jpegtran');
// const slash = require('slash');
//Set env
process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin";

// console.log(process.platform == "darwin");
// console.log(isMac);

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "imageshrink",
    width: isDev ? 700 : 500,
    height: 500,
    icon: "./assets/icons/Icon_256x256.png",
    backgroundColor: "white",
    resizable: isDev ? true : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  //   mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile("./app/index.html");
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About Window",
    width: 300,
    height: 300,
    icon: "./assets/icons/Icon_256x256.png",
    resizable: false,
  });

  aboutWindow.loadFile("./app/about.html");
}

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),

  // {
  //   label: "File",
  //   submenu: [
  //     {
  //       label: "Quit",
  //       // accelerator: isMac ? "Command+Q" : "Ctrl+Q",
  //       accelerator: "CmdOrCtrl+W",
  //       click: () => app.quit(),
  //     },
  //   ],
  // },
  {
    role: "fileMenu",
  },
  ...(!isMac ? [{ label: "help", click: createAboutWindow }] : []),
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            {
              role: "reload",
            },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

app.on("ready", () => {
  createMainWindow();
  //Using for going through menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //global shortcuts
  // globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  // globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
  //   mainWindow.toggleDevTools()
  // );

  mainWindow.on("ready", () => (mainWindow = null));
});

ipcMain.on("image:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageshrink");
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  const pngQuality = quality / 100;
  const imagemin = (await import("imagemin")).default;
  const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
  const imageminPngQuant = (await import("imagemin-pngquant")).default;
  const slash = (await import("slash")).default;
  try {
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngQuant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    console.log(files);
    shell.openPath(dest);

    mainWindow.webContents.send("image:done");
  } catch (error) {
    console.log(error);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.allowRenderProcessReuse = true;
