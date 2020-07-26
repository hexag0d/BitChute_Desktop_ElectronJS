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
var chooseThumbnailButton = document.getElementById('ChooseImageButton');
var uploadFileButton = document.getElementById('UploadButton');
var uploadThumbnailButton = document.getElementById('')

var diagnosticTextBox = document.getElementById('HttpsDiagnosticTextBox');
var endpointTextBox = document.getElementById('EndpointUrlTextBox');
var thumbnailSourceTextBox = document.getElementById('ThumbnailSourceText');

global.filepath = undefined; // not used ATM, was in the snippet ... interesting how JS uses so many globes, none of the kool kids use globes in c# ;]

chooseFileButton.addEventListener('click', () => {
    dialog.showOpenDialog({ properties: ['openFile'] }, function (paths) {
        console.log(paths)
        global.debugStatusTextBox[0].value = 'video file path =' + paths[0] + '\n';
        ipc.send(event_keys.GET_INPUT_PATH, paths[0]);
    })
})

chooseThumbnailButton.addEventListener('click', () => {
    dialog.showOpenDialog({filters: [{ name: 'Image Files', extensions: ['avi', 'mp4', '*.*'] },
        ], properties: ['openFile']
    }, function (paths) {
        console.log(paths)
        global.debugStatusTextBox[0].value = 'thumbnail file path =' + paths[0] + '\n';
        thumbnailSourceTextBox.value = paths[0]; // just one for now, but eventually want ability to mass upload
    })
})

uploadFileButton.addEventListener('click', () => {
    if (global.processedFileTextBox[0].value == '' || !global.processedFileTextBox[0].value) {
        alert('you havent selected a file'); return;
    } 
    uploadVideoFile(processedFileTextBox[0].value.toString());
})

function uploadVideoFile(source) {
     //Diag stuff
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
}

function getAxiosHeaders() {
    var authTokenTextBox = document.getElementById('AuthTokenTextBox');
    var toke = authTokenTextBox.value;
    var axiosHeader = {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${toke}`
        //"Access-Control-Allow-Origin": "*",
        //'User-Agent': 'Console app' ? //saving these here in case we need them, not enough to justify moving into unused snips @hexagod
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

