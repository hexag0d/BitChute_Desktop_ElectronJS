/*
 * A standardized filechooser that differentiates between operating systems 
 * @hexagod
 * 
 */
const electron = require('electron')
const ipc = require('electron').ipcRenderer
const dialog = electron.remote.dialog;
const path = require('path')

const file_chooser = {
    showXPlatformChooser,
}

module.exports = {
    showXPlatformChooser,
    encodeFile
}


chooseVideoFileButton = document.getElementById('ChooseVideoFile');
chooseThumbnailButton = document.getElementById('ChooseThumbnailButton');
thumbnailImage = document.getElementById('UploadThumbnailImage');
thumbnailSourceTextBox = document.getElementById('ProcessedFileLink')

chooseThumbnailOnClick = function () {
    var paths = file_chooser.showXPlatformChooser(null, null, global.thumbnailSourceTextBox);
    if (paths) {

        global.debugStatusTextBox.value = 'thumbnail file path =' + paths[0] + '\n';
        thumbnailSourceTextBox.value = paths[0]; // just one for now, but eventually want ability to mass upload
    }
}

chooseThumbnailButton = document.getElementById('ChooseThumbnailButton');
chooseThumbnailButton.addEventListener('click', chooseThumbnailOnClick());

chooseVideoFileButton.addEventListener('click', () => {
    file_chooser.showXPlatformChooser(null, null, 'inputPath');
})

chooseThumbnailButton.addEventListener('click', () => {
    var th_path = file_chooser.showXPlatformChooser(null, null, 'none');
    writeToDebug(th_path)
    thumbnailSourceTextBox.value = th_path;

    thumbnailImage.src = th_path;
})

var

function showXPlatformChooser(types, label, sendTo) {
    if (!types) { types = '*.*' }
    if (!label) { label = 'use' }
    if (process.platform !== 'darwin') { // If the platform is 'win32' or 'Linux'
        dialog.showOpenDialog({  // Resolves to a Promise<Object> 
            title: global.localVidChooserLabel,
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: label,
            filters: [{ name: global.localFiles, extensions: [types] },],  // Restricting the user to only x Files. 
            properties: ['openFile']
        }).then(file => {
            if (!file.canceled) {
                if (sendTo == 'none') { // no sendto set, return string immediately
                    console.log(file.filePaths[0].toString()); return file.filePaths[0].toString()
                }
                if (sendTo == 'inputPath') { //sendto input key for videos
                    console.log(file.filePaths[0].toString());
                    //ipc.send(event_keys.GET_VIDEO_INPUT_PATH, file.filePaths[0].toString()); return;
                    encodeFile(file.filePaths[0].toString());
                }
                else {
                    //ipc.send(event_keys.GET_VIDEO_INPUT_PATH, file.filePaths[0].toString()); this doesn't work.  The  event_keys.GET_VIDEO_INPUT_PATH events stopped functioning after I updated electron
                    console.log(file.filePaths[0].toString());
                    
                    encodeFile(file.filePaths[0]);
                }
            }
        }).catch(err => {
            console.log(err)
        });
    }
    else {
        // If the platform is 'darwin' (macOS) 
        dialog.showOpenDialog({
            title: global.localVidChooserLabel,
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'Text Files',
                    extensions: ['txt', 'docx']
                },],
            // Specifying the File Selector and Directory  
            // Selector Property In macOS 
            properties: ['openFile', 'openDirectory']
        }).then(file => {
            console.log(file.canceled);
            if (!file.canceled) {
                global.filepath = file.filePaths[0].toString();
                console.log(global.filepath);
            }
        }).catch(err => {
            console.log(err)
        });
    }
}

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const { event_keys } = require('./constants')

const url = require('url')
const fs = require('fs')

function encodeFile(file_path) {
    writeToDebug(file_path)
    try {
        //C:\Users\hegsagawd\desktop1\vid\5678.mp4

        const { ext, name, dir } = path.parse(file_path)
        var rndId = Math.floor((Math.random() * 10000000000) + 1);
        const proc = ffmpeg(file_path)
            .on('codecData', function (data) {
                writeToDebug(data);
                writeToDebug('processing video... ');
            })
            .on('end', function () {
                var _new_path = `${dir}/${name}_${rndId}${ext}`;
                onVideoFinishedProcessing(_new_path);
            })
            .on('error', function (err) {
                writeToDebug('an error happened: ' + err.message);
            })
            .on('progress', function ({ percentage }) {
            })
            .size('854x480')
            .audioBitrate('96k')
            .videoBitrate('213k')
            .save(`${dir}/${name}_${rndId}${ext}`)

    } catch (error) {
        alert(error);
    }
}

var processedFileTextBox = document.getElementById('')

function writeToDebug(text) { global.debugStatusTextBox.value += (text + '\n') }
var processedVidPathText = document.getElementById('ProcessedFileLink')

function onVideoFinishedProcessing(vidPath) {
    writeToDebug('video finished processing @' + vidPath);
    processedVidPathText.value = vidPath;
}

