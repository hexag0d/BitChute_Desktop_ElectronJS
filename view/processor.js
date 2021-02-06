/*
 * I haven't ported the app to MVVM yet due to time constraints
 * and making the decision.  I'm thinking Vue.js would be a 
 * good framework to use.  I'll be finishing up baseline functionality
 * then immediately switching this type of UI model to databinding
 * 
 * I was first trying to get the app usable so that I can post videos
 * and after it's useable no more features until the UI and Models
 * are seperate.
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
selectPreProcessedFileButton = document.getElementById('SelectPreProcessedFileButton');

thumbnailImage = document.getElementById('UploadThumbnailImage');

thumbnailSourceTextBox = document.getElementById('ThumbnailSourceText');
videoProcessorSourceTextBox = document.getElementById('VideoProcessorSourceTextBox');

//upload
uploadVideoButton = document.getElementById('UploadVideoButton');
uploadThumbnailButton = document.getElementById('UploadThumbnailButton');
upProgBar = document.getElementById('VideoUploadProgressBar');
thumbnailUploadProgressBar = document.getElementById('ThumbnailUploadProgressBar');

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

logoutButton = document.getElementById('LogoutButton');

videoProcessorWidthTextBox = document.getElementById('ProcessToWidthTextBox')
videoProcessorHeightTextBox = document.getElementById('ProcessToHeightTextBox')
videoProcessorVideoBitRateTextBox = document.getElementById('ProcessToVideoBitRateTextBox')
videoProcessorAudioBitRateTextBox = document.getElementById('ProcessToAudioBitRateTextBox')

curUserTb = document.getElementById('CurrentUserTextBox');