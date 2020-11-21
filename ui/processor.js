/*
 * This file should be temporary.  We need to quickly determine which databinding
 * library we're going to use.  This isn't a longterm viable way of handling the UI.
 * I am thinking about using ReactJS but haven't made the final decision yet.
 * 
 * Right now, the js UI objects will be grouped by screen.  
 * The main reason I haven't already started bringing this app onto
 * a databinding model is because I am waiting on a response from Ray and Rich 
 * on which library they want to use.
 * 
 * @hexagod
 */

//diag
debugStatusTextBox = document.getElementById('DebugStatusTextBox');
diagnosticTextBox = document.getElementById('HttpsDiagnosticTextBox');
videoProcessorProgressBar = document.getElementById('VideoProcessorProgressBar');

//file choosing
chooseVideoFileButton = document.getElementById('ChooseVideoFile');
chooseThumbnailButton = document.getElementById('ChooseThumbnailButton');

thumbnailImage = document.getElementById('UploadThumbnailImage');

thumbnailSourceTextBox = document.getElementById('ThumbnailSourceText');
videoProcessorSourceTextBox = document.getElementById('VideoProcessorSourceTextBox');

//upload
uploadVideoButton = document.getElementById('UploadVideoButton');
uploadThumbnailButton = document.getElementById('UploadThumbnailButton');

endpointTextBox = document.getElementById('EndpointUrlTextBox');
processedVideoTextBox = document.getElementById('ProcessedFileTextBox');

//login
loginButton = document.getElementById('LoginButton');
userNameTextBox = document.getElementById('UserNameTextBox');
passwordTextBox = document.getElementById('PasswordTextBox');
csrfMiddleWareTokenTextBox = document.getElementById('CsrfMiddleWareTokenTextBox');
getInitialResponseButton = document.getElementById('GetInitialResponseButton');
getUploadTokenButton = document.getElementById('GetUploadTokenButton');
loginDiagnosticTextBox = document.getElementById('LoginDiagnosticTextBox');
postingLocationTextBox = document.getElementById('PostingLocationTextBox');

writeToLogin = function writeToLoginDiag(msg) {
    loginDiagnosticTextBox.value = msg.toString();
}

document.addEventListener('newUiEvent', (event) => { writeToLogin(event.detail.message); });
document.addEventListener('newProgressEvent', (event) => {
    if (event.detail.sendTo == 'vidToken') {
        postingLocationTextBox.value = event.detail.data;
        writeToLogin(`got video auth path :` + '\n' + `${event.detail.data}`);
    }
    else if (event.detail.sendTo == 'csrfMiddleWareTokenTextBox') {
        csrfMiddleWareTokenTextBox.value = event.detail.data;
    }
});
