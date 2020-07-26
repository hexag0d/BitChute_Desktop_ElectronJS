/*
 * A standardized filechooser that differentiates between operating systems 
 * @hexagod
 * 
 */
const file_chooser = {
    showXPlatformChooser,
}

module.exports = {
    file_chooser,
    showXPlatformChooser
}

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
            console.log(file.canceled); // Stating whether dialog operation was cancelled or not. 
            if (!file.canceled) {
                if (!sendTo) { // no sendto set, return string immediately
                    console.log(file.filePaths[0].toString()); return file.filePaths[0].toString()
                }
                if (sendTo == 'inputPath') { //sendto input key for videos
                    console.log(file.filePaths[0].toString());
                    ipc.send(event_keys.GET_VIDEO_INPUT_PATH, file.filePaths[0].toString());
                    return;
                }
                sendTo.value = file.filePaths[0].toString();
                console.log(file.filePaths[0].toString());

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


//This is old, not sure if we still need it.  prolly can be deleted @hexagod

//types is either a single filetype or more likely an array of possible file types
//sendTo is where you want the filepath sent to
//@TODO localize strings, no time atm 
//function showXPlatformChooser(types, label, sendTo) {
//    if (!types) { types = '*.*' }
//    if (!label) { label = 'use' }
//    if (process.platform !== 'darwin') { // If the platform is 'win32' or 'Linux'
//        dialog.showOpenDialog({  // Resolves to a Promise<Object> 
//            title: global.localVidChooserLabel,
//            defaultPath: path.join(__dirname, '../assets/'),
//            buttonLabel: label,
//            filters: [{ name: global.localFiles, extensions: [types] },],  
//            properties: ['openFile']
//        }, function (paths) {
//            if (paths) {
//                if (!sendTo) { // no sendto set, return string immediately
//                    console.log(paths[0].toString()); return paths[0].toString()
//                }
//                if (sendTo === 'event_keys.GET_VIDEO_INPUT_PATH') { //sendto input key for videos, invokes ffmpeg
//                    console.log(paths[0].toString());
//                    ipc.send(event_keys.GET_VIDEO_INPUT_PATH, paths[0]); return;
//                }
//                sendTo.value = paths[0].toString();
//                console.log(paths[0].toString());
//            } else { console.log(''); }
//        })
//    }
//    else {
//        // If the platform is 'darwin' (macOS) 
//        dialog.showOpenDialog({
//            title: global.localVidChooserLabel,
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
//}
