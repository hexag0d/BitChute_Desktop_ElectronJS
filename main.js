/*
 * This file contains methods related to general app events
 * also contains mainWindow methods @hexagod
 */

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs')

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const { event_keys } = require('./constants')
var { lng_support } = require('./languagesupport.js')

let mainWindow

function createWindow() {
    lng_support.setLocalStrings(global.appLanguageSetting); // set the strings to their localized form @TODO not all strings set
    mainWindow = new BrowserWindow({
        width: 1280, height: 768,
          webPreferences: {
              //contextIsolation: true, ??? I don't have time to look into what this does @hexagod
              nodeIntegration: true,
            preload: './preload.js'
        }
    })
    window = mainWindow;
    window.$ = window.jQuery = require('jquery');
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    mainWindow.autoHideMenuBar = true;
    mainWindow.webContents.openDevTools()  // @DEBUG
    
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

const ipc = require('electron').ipcMain

// const path = require('path')

ipc.on(event_keys.GET_VIDEO_INPUT_PATH, function (event, filePath) {
    mainWindow.webContents.send('write-to-console', 'processing started..');
     console.log(filePath)
     try {
         const { ext, name, dir } = path.parse(filePath)
         var rndId = Math.floor((Math.random() * 10000000000) + 1);
         const proc = ffmpeg(filePath)
             .on('codecData', function(data) {
                 console.log(data);
                 //debugStatusTextBox.
             })
             .on('end', function() {
                 console.log('file has been converted succesfully');
                 var newPath = `${dir}/${name}_${rndId}${ext}`;
                 mainWindow.webContents.send('write-to-console', 'processing finished @ : ' + newPath);
                 mainWindow.webContents.send('forward-file', newPath);
             })
             .on('error', function(err) {
                 console.log('an error happened: ' + err.message);
                 mainWindow.webContents.send('write-to-console', 'error @ : ' + err.message);
             })
             .on('progress', function({ percent }) {
                 console.log('progress percent: ' + percent);
             })
             .size('854x480') 
             .audioBitrate('96k')
             .videoBitrate('213k')
             .save(`${dir}/${name}_${rndId}${ext}`)
     } catch (error) {
         mainWindow.webContents.send('write-to-console', error.message);
         alert(error);
     }
 })