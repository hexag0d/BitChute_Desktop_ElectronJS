//framework
const axios = require('axios');

var diag = require('./diagnostic.js')
const fs = require('fs')

uploadVideoButton.addEventListener('click', () => {
    if (global.processedVideoTextBox.value == '' || !global.processedVideoTextBox.value) {
        alert(global.localNoFileSelected); return;
    }
    uploadFile(global.processedVideoTextBox.value, 'video');
})

uploadThumbnailButton.addEventListener('click', () => {
    if (global.thumbnailSourceTextBox.value == '' || !global.thumbnailSourceTextBox.value) {
        alert(global.localNoFileSelected); return;
    }
    uploadFile(global.thumbnailSourceTextBox.value, 'thumbnail');
})

function uploadFile(source, type) {
    var sendTo = endpointTextBox.value;
    if (!endpointIsBitChute(sendTo) && (document.getElementById('AuthTokenTextBox').value != '')) {
        alert(localUnsafeRequestDetected); 
        return;
    } 
    postData(source, type, getAxiosConfig(endpointIsBitChute(sendTo)), sendTo); 
}

function endpointIsBitChute(url) {
    try {
        if ((url.toString().split('.')[1] === 'bitchute') && url.toString().split('.')[2].startsWith('com/')) {
            return true;
        }
    }
    catch (err) { diag.writeToDiagnosticText(err.message); return false; }    
    return false;
}

function getAxiosConfig(forBitChute) { 
    var hed = getAxiosHeaders(forBitChute);
    var axCon = {
        onUploadProgress: progressEvent => diag.writeToDebug(progressEvent.loaded),
        headers: hed
    }
    if (forBitChute) {
        var tempAt = hed.Authorization.toString(); 
        var maskedAuth = tempAt.slice(0, 10); 
        diag.writeToDiagnosticText(maskedAuth);
        diag.writeToDiagnosticText(getAxiosHeaders()["Content-Type"].toString());
    }
    hed = undefined;
    return axCon;
}

function getAxiosHeaders(forBitChute) { 
    var axiosHeader = undefined;
    if (forBitChute) {
        var authTokenTextBox = document.getElementById('AuthTokenTextBox');
        var toke = authTokenTextBox.value;
        axiosHeader = {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${toke}`
        }
        toke = undefined;
        authTokenTextBox = undefined;
    } else {
        axiosHeader = {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        }
    }
    return axiosHeader;
}


async function postData(localDataPath, type, config, url) { 
    var formData = new FormData();
    if (type === 'video' || 'thumbnail') {
        formData.append('file', fs.createReadStream(localDataPath));
    } else { formData.append('file', localDataPath) }
    var rescon = [];
    await axios.post(url, formData, config)
        .then(function (res) {
            diag.writeToDiagnosticText(`Status code: ${res.status}`);
            diag.writeToDiagnosticText(`Status text: ${res.statusText}`);
            diag.writeToDiagnosticText(`Request method: ${res.request.method}`);
            diag.writeToDiagnosticText(`Path: ${res.request.path}`);
            diag.writeToDiagnosticText(`Date: ${res.headers.date}`);
            diag.writeToDiagnosticText(`Data: ${res.data}`);
            diag.writeToDiagnosticText('\n');
            }
        ).catch(function (error) {
            diag.writeToDiagnosticText(error.message)
        })
}
