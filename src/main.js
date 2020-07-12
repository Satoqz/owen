const { app, BrowserWindow, Tray, Menu, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const DiscordRPC = require("discord-rpc");
const { autoUpdater } = require("electron-updater");

const iconpath = path.join(__dirname, "/appassets/owen.ico");

const instanceLock = app.requestSingleInstanceLock();

let win;

app.on("second-instance", () => {
    if (win) {
        if (win.isMinimized()) {
            win.restore();
        }
        win.focus();
    }
});

if (!instanceLock) {
    return app.quit();
}

function createWindow() {
    win = new BrowserWindow({
        frame: false,
        width: 900,
        height: 600,
        icon: iconpath,
        resizable: false,
        titleBarStyle: "hidden",
        webPreferences: {
            nodeIntegration: true,
        },
    });

    //win.setMenu(null);

    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
    }));

    const appIcon = new Tray(iconpath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Quit",
            click() {
                app.isQuiting = true;
                app.quit();
                app.exit();
            },
        },
    ]);

    appIcon.on("click", () => win.show());

    appIcon.on("right-click", () => appIcon.setContextMenu(contextMenu));

    win.on("close", (event) => {
        event.preventDefault();
        win.hide();
    });
        
    ipcMain.on("presence-update", (event, arg) => setActivity(arg.line1, arg.line2, arg.hover, arg.imageKey));
        
    ipcMain.on("close-app", () => win.hide());
}

const clientId = "727887407491317910";

const rpc = new DiscordRPC.Client({ transport: "ipc" });
const startTimestamp = new Date();

DiscordRPC.register(clientId);

async function setActivity(line1, line2, hover, imageKey) {

    if (!rpc || !win) return;

    rpc.setActivity({
        details: line1,
        state: line2,
        startTimestamp,
        largeImageKey: imageKey,
        largeImageText: hover,
        instance: true,
        spectateSecret: "owen",
    });
}

rpc.login({ clientId }).catch(console.error);

app.on("ready", () => {
    autoUpdater.checkForUpdatesAndNotify();
    createWindow();
});