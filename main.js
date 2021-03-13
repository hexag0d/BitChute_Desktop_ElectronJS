/*
 * This file contains methods related to general app events
 * also contains mainWindow methods @hexagod
 */

const electron = require('electron')
const { protocol } = require('electron');
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs')

const { event_keys } = require('./constants')
const app_setting = require('./settings.js')

const contextMenu = require('electron-context-menu')

let mainWindow;

module.exports = {

}

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1280, height: 768,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: './preload.js'
        }
    })

    window = mainWindow;
    window.$ = window.jQuery = require('jquery');
    mainWindow.autoHideMenuBar = true;
    mainWindow.setMenu(null) // @RELEASE

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    if (app_setting.debugLocalApp) {
        mainWindow.webContents.openDevTools()  // @DEBUG
    }
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on("web-contents-created", (e, contents) => {
    contextMenu({
        window: contents,
        showSaveImageAs: true,
        showInspectElement: true,
        showLookUpSelection: false,
        showSearchWithGoogle: false,
        showSaveImage: true
    });
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
