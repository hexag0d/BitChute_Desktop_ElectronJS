//framework
const electron = require('electron')
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const { event_keys } = require('./constants')
const ipc = require('electron').ipcRenderer
const dialog = electron.remote.dialog;

//ui
var chooseFileButton = document.getElementById('ChooseFile');
var uploadFileButton = document.getElementById('UploadButton');

global.filepath = undefined;


chooseFileButton.addEventListener('click', () => {
    dialog.showOpenDialog({ properties: ['openFile'] }, function (paths) {
        console.log(paths)
        global.debugStatusTextBox[0].value = 'file path ' + paths[0] + '\n';
        ipc.send(event_keys.GET_INPUT_PATH, paths[0]);
    })
})

uploadFileButton.addEventListener('click', () => {
    global.debugStatusTextBox[0].value = global.axiosConfig.headers.Authorization.toString();
    //global.debugStatusTextBox[0].value = 'test';
})

function postVideoData(localDataPath, authToken, cookies, url) {
    var formData = new FormData();
    formData.append('file', fs.createReadStream(global.filepath));
    axios.post('[Custom URL]', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//if (global.filepath && !file.canceled) {
//    var formData = new FormData();
//    formData.append('file', fs.createReadStream(global.filepath));
//    axios.post('[Custom URL]', formData, {
//        headers: {
//            'Content-Type': 'multipart/form-data'
//        }
//    });
//}
//uploadFile.addEventListener('click', () => {
//    // If the platform is 'win32' or 'Linux' 
//    if (process.platform !== 'darwin') {
//        // Resolves to a Promise<Object> 
//        dialog.showOpenDialog({
//            title: 'Select the File to be uploaded',
//            defaultPath: path.join(__dirname, '../assets/'),
//            buttonLabel: 'Upload',
//            // Restricting the user to only Text Files. 
//            filters: [
//                {
//                    name: 'Video Files',
//                    extensions: ['avi', 'mp4', '*.*']
//                },],
//            // Specifying the File Selector Property 
//            properties: ['openFile']
//        }).then(file => {
//            // Stating whether dialog operation was 
//            // cancelled or not. 
//            console.log(file.canceled);
//            if (!file.canceled) {
//                // Updating the GLOBAL filepath variable  
//                // to user-selected file. 
//                global.filepath = file.filePaths[0].toString();
//                console.log(global.filepath);
//            }
//        }).catch(err => {
//            console.log(err)
//        });
//    }
//    else {
//        // If the platform is 'darwin' (macOS) 
//        dialog.showOpenDialog({
//            title: 'Select the File to be uploaded',
//            defaultPath: path.join(__dirname, '../assets/'),
//            buttonLabel: 'Upload',
//            filters: [
//                {
//                    name: 'Text Files',
//                    extensions: ['txt', 'docx']
//                },],
//            // Specifying the File Selector and Directory  
//            // Selector Property In macOS 
//            properties: ['openFile', 'openDirectory']
//        }).then(file => {
//            console.log(file.canceled);
//            if (!file.canceled) {
//                global.filepath = file.filePaths[0].toString();
//                console.log(global.filepath);
//            }
//        }).catch(err => {
//            console.log(err)
//        });
//    }
//}); 

