const { app, BrowserWindow } = require("electron");

let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "imageshrink",
    width: 500,
    height: 500,
  });

  //   mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile("./app/index.html");
}

app.on("ready", createMainWindow);
