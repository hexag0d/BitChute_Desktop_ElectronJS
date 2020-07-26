/*
 * This file contains snips that might be useful for later applications
 * It is typically just to store syntax 
 * and to avoid having random hunks of unused code laying around the app.
 * 
 * Apparently devs don't like that ;} @hexagod
 */

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

