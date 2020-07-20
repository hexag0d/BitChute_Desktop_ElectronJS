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
var diagnosticTextBox = document.getElementById('HttpsDiagnosticTextBox');
var endpointTextBox = document.getElementById('EndpointUrlTextBox');

global.filepath = undefined; // not used ATM, was in the snippet ... interesting how JS uses so many globes, none of the kool kids use globes in c# ;]


chooseFileButton.addEventListener('click', () => {
    dialog.showOpenDialog({ properties: ['openFile'] }, function (paths) {
        console.log(paths)
        global.debugStatusTextBox[0].value = 'file path ' + paths[0] + '\n';
        ipc.send(event_keys.GET_INPUT_PATH, paths[0]);
    })
})

uploadFileButton.addEventListener('click', () => {
    if (global.processedFileTextBox[0].value == '' || !global.processedFileTextBox[0].value) {
        alert('you havent select a file'); return;
    } //Diag stuff
    var tempAuthToken = getAxiosHeaders().Authorization.toString(); // this is a token so I don't think we should leave it laying around
    var maskedAuth = tempAuthToken.slice(0, 10); //take the token and keep only the bearer + ~3 chars, which isn't enough to steal the token, but likely enough to see what you're getting
    maskedAuth = (maskedAuth + 'xxxxxxxxxxxxxxxxxx') // build the masked string for diag
    writeToDiagnosticText(maskedAuth);
    writeToDiagnosticText(getAxiosHeaders()["Content-Type"].toString());
    tempAuthToken = undefined;
    maskedAuth = undefined;
    //now do the actual POST
    var pvp = processedFileTextBox[0].value.toString();
    var sendTo = endpointTextBox.value.toString();
    postVideoData(pvp, getAxiosHeaders(), sendTo);
})

function getAxiosHeaders() {
    var authTokenTextBox = document.getElementById('AuthTokenTextBox');
    var toke = authTokenTextBox.value;
    var axiosHeader = {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${toke}`
            //"Access-Control-Allow-Origin": "*",
        //'User-Agent': 'Console app' ?
    }
    toke = undefined;
    authTokenTextBox = undefined;
    return axiosHeader;
}

async function postVideoData(localDataPath, headers, url) {
    var formData = new FormData();
    formData.append('file', fs.createReadStream(localDataPath));
    let res = await axios.post(url, formData, { headers: headers });
    writeToDiagnosticText(`Status code: ${res.status}`);
    writeToDiagnosticText(`Status text: ${res.statusText}`);
    writeToDiagnosticText(`Request method: ${res.request.method}`);
    writeToDiagnosticText(`Path: ${res.request.path}`);
    writeToDiagnosticText(`Date: ${res.headers.date}`);
    writeToDiagnosticText(`Data: ${res.data}`);
}

function writeToDiagnosticText(text) { diagnosticTextBox.value += (text + '\n') }

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

