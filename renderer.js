// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { event_keys } = require('./constants')

const ipc = require('electron').ipcRenderer
window.$ = window.jQuery = require('jquery');
window.lng_spt = require('./languagesupport.js');

const asyncMsgBtn = document.getElementById('async-msg')
const config = window.readConfig();

asyncMsgBtn.addEventListener('click', function () {
    ipc.send('asynchronous-message', 'ping')
})

ipc.on('asynchronous-reply', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`
    console.log(message)
    global.debugStatusTextBox[0].value += message;
})

const { dialog } = require('electron').remote

ipc.on('write-to-console', (event, ...args) => {
    global.debugStatusTextBox[0].value += ([...args].toString() + '\n');
    //event.sender.send('sum-reply', [...args].reduce(add, 0))
})

ipc.on('forward-file', (event, ...args) => {
    global.processedFileTextBox[0].value += ([...args].toString() + '\n');
})

//ipc.on('write-to-console-with-callback', (event, ...args) => {
//    global.debugStatusTextBox[0].value += [...args].reduce(add, 0).toString();
//    //event.sender.send('sum-reply', [...args].reduce(add, 0))
//})