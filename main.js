
const electron = require('electron')
var { Menu } = require('electron')
// Module to control application life.
var app = electron.app
//var menu = Menu.buildFromTemplate()
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs')

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const encodesettings = require('./encoding/settings');

const { event_keys } = require('./constants')




// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
    var mainWindow = new BrowserWindow({
        width: 800, height: 600, webPreferences: {
            nodeIntegration: true
            ,
            //enableRemoteModule: true
        }
    })
    mainWindow.setMenuBarVisibility(false)
    
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
    }))
  // Open the DevTools.
    mainWindow.webContents.openDevTools()  // @DEBUG
    mainWindow.setBackgroundColor('black')
    
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and require them here.

    const ipc = require('electron').ipcMain

    ipc.on(event_keys.GET_INPUT_PATH, function (event, filePath) {
        console.log(filePath);
        var { extt, namee, dirr } = path.parse(filePath); 
        $('#debugAreaText')[0].value = (ext.toString() + "  " + name.toString() + "   " + dir.toString());
        try {
            var rndId = Math.floor((Math.random() * 1000000) + 1);
            const proc = ffmpeg(filePath)
                .on('codecData', function (data) {
                    console.log(data);
                })
                .on('end', function () {
                    console.log('file has been converted succesfully');
                })
                .on('error', function (err) {
                    console.log('an error happened: ' + err.message);
                })
                .on('progress', function ({ percent }) {
                    console.log('progress percent: ' + percent);
                })
                .size('854x480')
                .audioBitrate('96k')
                .videoBitrate('213k')
                .save(`${dirr}/${namee}_${rndId}${extt}`)
        } catch (error) {
            alert(error)
        }
    })