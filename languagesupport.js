/*
 * This file contains language support for the future
 * I don't really have enough time to translate at the moment, but this
 * way I won't have to undo hardcoded strings later on down the line.
 * Yes, I know: there's already hardcoded strings.  I was just testing the basic
 * functionality of the app but I'll be slowly moving them into this file 
 * 
 * I haven't had a chance to do this for the whole UI yet.  I need to find a good
 * databinding library before I go hogwild with it.
 * 
 * @hexagod
 */

//global localized strings to be set on app load

localChoose = '';
localUpload = '';
localVidChooserLabel = '';
localNoFileSelected = '';
localNoUploadSource = '';
localFiles = '';
localVideoFinishedProcessing = '';
localProcessingVideo = '';
localGeneralError = '';
localVideoSourceSelected = '';
localThumbnailSelectedAt = '';
localVideoFramesProcessed = '';
localVideoPercentageComplete = '';
localUnsafeRequestDetected = '';
local_login_success = '';
localUnableToGetPostingPath = '';
localUnableToPostNoVideoData = '';
localUnableToPostNoThumbnail = '';
//begin English =-=-

function setLocalStringsToEng() {
    localChoose = 'Choose a File ';
    localUpload = 'Upload ';
    localVidChooserLabel = 'Select the File to be uploaded ';
    localNoFileSelected = 'No file selected.. choose one first ';
    localNoUploadSource = 'there is no file to upload; select one first';
    localFiles = 'Files ';
    localVideoFinishedProcessing = 'video finished processing ';
    localProcessingVideo = 'processing video ';
    localGeneralError = 'an error happened: ';
    localVideoSourceSelected = 'video source selected ';
    localThumbnailSelectedAt = 'thumbnail selected ';
    localVideoFramesProcessed = 'frames processed';
    localVideoPercentageComplete = ' percent completed';
    localUnsafeRequestDetected = 'unsafe POST path detected, you are posting your auth token to a non-bitchute endpoint.';
    local_login_success = 'successfully logged in as user ';
    localUnableToGetPostingPath = 'unable to get posting path; are you logged in?';
    localUnableToPostNoVideoData = 'unable to post video because video data not uploaded; upload the video first';
    localUnableToPostNoThumbnail = 'unable to post video because thumbnail has no been uploaded' + '\n' +
        'post the thumbnail first and try again';
}

//end English =-=-

function setLocalStrings(lang) {
    switch (lang) {
        case 'eng': setLocalStringsToEng();
    }
}

module.exports = {
    setLocalStrings
}
