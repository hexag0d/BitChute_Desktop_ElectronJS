//types is either a single filetype or more likely an array of possible file types
//@TODO localize strings, no time atm 
showXPlatformChooser = function (types, label) {
    if (!types) { types = '*.*' }
    if (!label) { label = 'use' } 
    if (process.platform !== 'darwin') { // If the platform is 'win32' or 'Linux'
        dialog.showOpenDialog({  // Resolves to a Promise<Object> 
            title: global.localVidChooserLabel,
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: label,
            // Restricting the user to only Text Files. 
            filters: [{ name: 'Video Files', extensions: [types] },],
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
            }
        }).catch(err => {
            console.log(err)
        });
    }
    else {
        // If the platform is 'darwin' (macOS) 
        dialog.showOpenDialog({
            title: 'Select the File to be uploaded',
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
