// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { event_keys } = require('./constants')

const ipc = require('electron').ipcRenderer
window.$ = window.jQuery = require('jquery');
window.lng_spt = require('./languagesupport.js');

const asyncMsgBtn = document.getElementById('async-msg')
const pre = require('./preload')
const config = window.readConfig();

asyncMsgBtn.addEventListener('click', function () {
    ipc.send('asynchronous-message', 'ping')
})

ipc.on('asynchronous-reply', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`
    console.log(message)
    global.debugStatusTextBox.value += message;
})

//const { dialog } = require('electron').remote

ipc.on('write-to-console', (event, ...args) => {
    global.debugStatusTextBox.value += ([...args].toString() + '\n');
    console.log([...args].toString());
    //event.sender.send('sum-reply', [...args].reduce(add, 0)) // callback reply
})

ipc.on('forward-file', (event, ...args) => {
    global.processedFileTextBox.value += ([...args].toString() + '\n');
})

ipc.on('write-to-console-with-callback', (event, ...args) => {
    global.debugStatusTextBox.value += [...args].reduce(add, 0).toString();
    //event.sender.send('sum-reply', [...args].reduce(add, 0))
})