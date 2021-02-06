/*
 * A standardized filechooser that differentiates between operating systems 
 * @hexagod
 */
const electron = require('electron')
const ipc = require('electron').ipcRenderer
const dialog = electron.remote.dialog
const path = require('path')
const video_encoder = require('./video_encoding.js')

var diag = require('./diagnostic.js')

module.exports = {
    showXPlatformChooser
}

generalStaticFilePath = '';
temFile = undefined;

function showXPlatformChooser(types, label, sendTo) {
    if (!types) { types = '*.*' }
    if (!label) { label = 'use' }
    if (process.platform !== 'darwin') { // If the platform is 'win32' or 'Linux'
        dialog.showOpenDialog({  
            title: global.localVidChooserLabel,
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: label,
            filters: [{ name: global.localFiles, extensions: [types] },],  // Restricting the user to only x Files. 
            properties: ['openFile']
        }).then(file => {
            if (!file.canceled) {
                console.log(file.filePaths[0]);
                if (sendTo == 'thumbnailUploadSource') { // no sendto set, return string immediately
                    onThumbnailChosen(file.filePaths[0]);
                    return;
                }
                else if (sendTo == 'videoProcessorSource') {
                    onVideoSourceChosen(file.filePaths[0], true);
                    return;
                }
                else if (sendTo == 'videoUploadSource') { //sendto video upload source
                    onVideoSourceChosen(file.filePaths[0]);
                    return;
                }
                else if (sendTo) { // send to any place
                    try { sendTo = file.filePaths[0]; }
                    catch (err) { diag.writeToDebug(err.message) }
                    return;
                }
                else if (!sendTo) { // return to to generic 
                    return file.filePaths[0];
                }
            }
        }).catch(err => {
               diag.writeToDebug(err.message); console.log(err)
        });
    } else {
        dialog.showOpenDialog({ // the platform is 'darwin' (macOS) 
            title: global.localVidChooserLabel,
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: localUpload,
            filters: [{ name: global.localFiles, extensions: [types] },],
            //filters: [{
            //    name: global.localFiles,
            //        extensions: ['avi', 'mp4', 'mov'] //I'm not sure if mov is actually supported by ffmpeg?
            //    },],
            properties: ['openFile', 'openDirectory'] 
        }).then(file => { // @TODO someone with a mac needs to test this @hexagod
            console.log(file.canceled);
            if (!file.canceled) {
                console.log(file.filePaths[0]);
                if (sendTo == 'thumbnailUploadSource') { 
                    onThumbnailChosen(file.filePaths[0]);
                    return;
                }
                else if (sendTo == 'videoProcessorSource') {
                    onVideoSourceChosen(file.filePaths[0], true);
                    return;
                }
                else if (sendTo == 'videoUploadSource') {
                    onVideoSourceChosen(file.filePaths[0]);
                    return;
                }
                else if (sendTo) { 
                    sendTo = file.filePaths[0];
                    return;
                }
                else if (!sendTo) { 
                    return file.filePaths[0]; 
                }
            }
        }).catch(err => {
            diag.writeToDiagnosticText(err.message); console.log(err)
        });
    }
}

function onVideoSourceChosen(vid_path, encodeFile) {
    diag.writeToDebug(global.localVideoSourceSelected + '\n' + vid_path);
    if (encodeFile) {
        videoProcessorSourceTextBox.value = vid_path;
        video_encoder.encodeFile(vid_path);
    } else {
        processedVideoTextBox.value = vid_path;
    }
}

function onThumbnailChosen(file_path) {
    thumbnailSourceTextBox.value = file_path;
    thumbnailImage.src = file_path;
    thumbnailImage.height = (thumbnailImage.width * 0.5625); // there might be a better way to do this with css
    diag.writeToDebug(global.localThumbnailSelectedAt + ' @ ' + file_path);
}