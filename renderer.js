// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { event_keys } = require('./constants')
window.$ = window.jQuery = require('jquery');
const ipc = require('electron').ipcRenderer

const asyncMsgBtn = document.getElementById('async-msg')

asyncMsgBtn.addEventListener('click', function () {
    ipc.send('asynchronous-message', 'ping')
})

ipc.on('asynchronous-reply', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`
    console.log(message)

})

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { event_keys } = require('./constants')

const ipc = require('electron').ipcRenderer

const asyncMsgBtn = document.getElementById('async-msg')

asyncMsgBtn.addEventListener('click', function () {
    ipc.send('asynchronous-message', 'ping')
})

ipc.on('asynchronous-reply', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`
    console.log(message)

})

const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.BLACK
    
});

customTitlebar.updateItemBGColor(new Color(new RGBA(0, 0, 0, .7)))
titlebar.updateBackground(new Color(new RGBA(0, 0, 0, .7)));


titlebar.updateItemBGColor(new Color(new RGBA(0, 0, 0, .7)));

menubar.updateBackground(new Color(new RGBA(0, 0, 0, .7)));

const { dialog } = require('electron').remote
// console.log(dialog)

dialog.showOpenDialog({properties: ['openFile']}, function (paths) {
    console.log(paths)
    ipc.send(event_keys.GET_INPUT_PATH, paths[0])
})