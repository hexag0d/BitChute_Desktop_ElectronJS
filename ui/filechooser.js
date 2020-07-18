const electron = require('electron');
const dialog = electron.remote.dialog;
uploadButton = document.getElementById('uploadButton');
fileChooser = document.getElementById('videoInput');



var sendVid = function () {
    console.log(fileChooser.files[0].path);
    ipc.send(event_keys.GET_INPUT_PATH, fileChooser.files[0].path)
}

//dialog.properties = ['openFile'];
//dialog.buttonLabel = 'Process';

//dialog.then(file => {
//    // Stating whether dialog operation was 
//    // cancelled or not. 
//    console.log(file.canceled);
//    if (!file.canceled) {
//        // Updating the GLOBAL filepath variable  
//        // to user-selected file. 
//        global.filepath = file.filePaths[0].toString();
//        console.log(global.filepath);
//        if (fileChooser.files.length > 0) { $('#uploadButton')[0].value = 'process and upload' }
//    } else if (file.canceled) { }
//});

//dialog.filters = [{ name: 'Video Files', extensions: ['mp4', 'avi', '*.*', 'mp2'] }]


var fileChooserOnClick = function () {
    dialog.showOpenDialog({//			
        title: 'Select the File to be uploaded',
        //defaultPath: path.join(__dirname, '../assets/'),
        buttonLabel: 'Upload',
        // Restricting the user to only Text Files. 
        filters: [
            {
                name: 'Video Files',
                extensions: ['mp4', 'avi', '*.*', 'mp2'] // @TODO: I don't know if all of these are actually supported
            },],
        // Specifying the File Selector Property 
        properties: ['openFile']
    }).then(file => {
            // Stating whether dialog operation was 
            // cancelled or not. 
            console.log(file.canceled);
            if (!file.canceled) {
                // Updating the GLOBAL filepath variable  
                // to user-selected file. 
                global.filepath = file.filePaths[0].toString();
                console.log(global.filepath);
                $('#videoSource')[0].value = file.filePaths[0]
                $('#uploadButton')[0].value = 'process and upload' 
            }
        })
}
$('#videoInput')[0].onmousedown = fileChooserOnClick;


//const electron = require('electron');
//const path = require('path');
//// Importing dialog module using remote 
//const dialog = electron.remote.dialog;
//const dialog = electron.remote.dialog;
//const { event_keys } = require('./constants');
//const ipc = electron.ipcRenderer;
//var uploadFile = document.getElementById('videoInput');
//var uploadButton = document.getElementById('uploadButton');

//// Defining a Global file path Variable to store  
//// user-selected file 
//global.filepath = undefined;
//uploadFile.addEventListener('click', () => {
//	// If the platform is 'win32' or 'Linux' 
//	if (process.platform !== 'darwin') {
//		// Resolves to a Promise<Object> 
//		dialog.showOpenDialog({
//			title: 'Select the File to be uploaded',
//			defaultPath: path.join(__dirname, '../assets/'),
//			buttonLabel: 'Upload',
//			// Restricting the user to only Text Files. 
//			filters: [
//                {
//                	name: 'Video Files',
//                	extensions: ['mp4', 'avi', '*.*', 'mp2'] // @TODO: I don't know if all of these are actually supported
//                }, ],
//			// Specifying the File Selector Property 
//			properties: ['openFile']
//		}).then(file => {
//			// Stating whether dialog operation was 
//			// cancelled or not. 
//			console.log(file.canceled);
//			if (!file.canceled) {
//				// Updating the GLOBAL filepath variable  
//				// to user-selected file. 
//				global.filepath = file.filePaths[0].toString();
//				console.log(global.filepath);
//				uploadButton.textContent = 'process and upload!';
//			}
//		}).catch(err => {
//			console.log(err)
//		});
//	}
//	else {
//		// If the platform is 'darwin' (macOS) 
//		dialog.showOpenDialog({
//			title: 'Select the File to be uploaded',
//			defaultPath: path.join(__dirname, '../assets/'),
//			buttonLabel: 'Upload',
//			filters: [
//                {
//                	name: 'Text Files',
//                	extensions: ['txt', 'docx']
//                }, ],
//			// Specifying the File Selector and Directory  
//			// Selector Property In macOS 
//			properties: ['openFile', 'openDirectory']
//		}).then(file => {
//			console.log(file.canceled);
//			if (!file.canceled) {
//				global.filepath = file.filePaths[0].toString();
//				console.log(global.filepath);
//			}
//		}).catch(err => {
//			console.log(err)
//		});
//	}
//});

//uploadButton.addEventListener('click', () => {
//	ipc.send(event_keys.GET_INPUT_PATH, global.filepath[0])
//});

////dialog.showOpenDialog({ properties: ['openFile'] }, function (paths) {
////	console.log(paths)
////	ipc.send(event_keys.GET_INPUT_PATH, global.filepath[0])
////})