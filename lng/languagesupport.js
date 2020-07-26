/*
 * This file contains language support for the future
 * I don't really have enough time to translate at the moment, but this
 * way I won't have to undo hardcoded strings later on down the line.
 * Yes, I know: there's already hardcoded strings.  I was just testing the basic
 * functionality of the app but I'll be slowly moving them into this file @hexagod
 */

setLocalStrings = function (lang) {
    switch (lang) {
        case 'eng': setLocalStringsToEng();
    }
}

localChoose = '';
localUpload = '';
localVidChooserLabel = '';
localNoFileSelected = '';


//begin English =-=-
setLocalStringsToEng = function () {
    localChoose = '';
    localUpload = '';
    localVidChooserLabel = 'Select the File to be uploaded';
    localNoFileSelected = '';
}

//end English