/*
 * This file contains language support for the future
 * I don't really have enough time to translate at the moment, but this
 * way I won't have to undo hardcoded strings later on down the line.
 * Yes, I know: there's already hardcoded strings.  I was just testing the basic
 * functionality of the app but I'll be slowly moving them into this file @hexagod
 */

const lng_support = {
    setLocalStrings,
}

module.exports = {
    lng_support,
    setLocalStrings,
}

function setLocalStrings(lang) {
    switch (lang) {
        case 'eng': setLocalStringsToEng();
    }
}

//global localized strings to be set on app load
localChoose = '';
localUpload = '';
localVidChooserLabel = '';
localNoFileSelected = '';
localFiles = '';

//begin English =-=-
setLocalStringsToEng = function () {
    localChoose = 'Choose a Filec';
    localUpload = 'Upload';
    localVidChooserLabel = 'Select the File to be uploaded';
    localNoFileSelected = 'No file selected.. choose one first';
    localFiles = 'Files';
}

//end English =-=-

