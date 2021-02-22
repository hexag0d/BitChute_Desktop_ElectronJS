/*
 * The app is not currently using MVVM pattern but it's getting there!
 * Three reasons it's not using databinding:
 * 
 * 1.) the app didn't have a UI at all when I forked it
 * 2.) i've just been building out a basic UI that works
 *      and experimenting with a lot of stuff so that's why
 *      you see UI stuff mixed in with the business logic
 * 3.) I wanted some time to think about which library to
 *  implement
 *
 *  However, once the app is functional i won't be adding
 *  any bells and whistles until it's moved over to MVVM.
 *  I don't want another android app on my hands.... 
 *  we all know how that turned out lol!  Got too deep in
 *  tha game with no data binding and it became a nightmare!
 *  
 *  I'm eyeing vuejs right now as it looks easy to implement quickly
 *  @hexagod
 */

//var shell = require('shell') // I think this is how links open outside of the app but it seems missing, disabled for now

const event_generation = require('../vm/event_generators.js');
const upload_method = require('../src/upload.js');
const settings = require('../settings.js');
session_state = require('../src/session_state.js');
const vid_encoding = require('../src/video_encoding.js');
const chooser = require('../src/filechooser.js');

vm_video_data_finished = false;
vm_video_thumbnail_finished = false;
vm_video_meta_data_finished = false;

videoProcessingInProgress = false;

autoUploadAfterVideoFinishedProcessing = false;
userRequestedVideoPostBeforeUpload = false;

writeToLogin = function writeToLoginDiag(msg) {
    loginDiagnosticTextBox.value = msg.toString();
}

// these aren't working ATM so disabled until I get a chance to fix them

//fillMpegSrc = async function fillFfmpegSource() {
//    var mpegSrc = await session_state.getAnyCookieValueFromSession('ffmpeg_path');
//} 

//fillMpegSrc();

ffmpegSourceChanged = function () {
    ffmpegPath_check = document.getElementById('FFMpegSourceTextBox');
    //session_state.buildCookie(true, null, null, null, { // @TODO cookie needs to be fixed, not sure why not working
    //    name: 'ffmpeg_path',
    //    value: ffmpegPath_check
    //})
}

desiredMaxVideoBitRate = document.getElementById('DesiredVideoBitRateMaxTextBox').value;

document.getElementById('DesiredVideoBitRateMaxTextBox').addEventListener('change', () => {
    if (document.getElementById('DesiredVideoBitRateMaxTextBox').value <= 0) {
        alert('desired bitrate must be greater than 0kbps');
        document.getElementById('DesiredVideoBitRateMaxTextBox').value = 0;
        desiredFileSizeInMB = 0;
    }
    desiredMaxVideoBitRate = document.getElementById('DesiredVideoBitRateMaxTextBox').value;
})

desiredFileSizeInMB = document.getElementById('DesiredFileSizeTextBox').value;

document.getElementById('DesiredFileSizeTextBox').addEventListener('change', () => {
    if (document.getElementById('DesiredFileSizeTextBox').value <= 0) {
        alert('file size must be greater than 0MB');
        document.getElementById('DesiredFileSizeTextBox').value = 0;
        desiredFileSizeInMB = 0;
    }
    desiredFileSizeInMB = document.getElementById('DesiredFileSizeTextBox').value;
})

document.addEventListener('onBitRateCalculationFinished', (event) => {
    videoEncoderSettingVideoBitrate = event.detail.data.videoBitRate.toString() + 'k';
    document.getElementById('ProcessToVideoBitRateTextBox').value = event.detail.data.videoBitRate;
})

document.getElementById('FFMpegSourceTextBox').value = ffmpegPath;

document.getElementById('FFMpegSourceTextBox').onchange += ffmpegSourceChanged;

async function getFFMpegSourceFromChooser() {
    var fmpgsrc = await chooser.showXPlatformChooser(null, null, 'ffmpegSource');
    if (fmpgsrc != undefined) {
        if (fmpgsrc.type == 'string') {
            document.getElementById('FFMpegSourceTextBox').value = fmpgsrc;
        }
    }
}

document.getElementById('FFMpegSourceButton').addEventListener('click', () => {
    getFFMpegSourceFromChooser();
})

document.addEventListener('ffmpeg_source_selected', (event) => {
    document.getElementById('FFMpegSourceTextBox').value = event.detail.data;
    session_state.buildCookie(true, null, null, null, {
        name: 'ffmpeg_path',
        value: event.detail.data
    })
})

chooseVideoFileButton.addEventListener('click', () => {
    if (videoProcessingInProgress) {
        if (confirm('video processing is already in progress; would you like to cancel and process a new video?')) {
            vid_encoding.cancelVideoProcessing();
            videoProcessingInProgress = false;
        } else {
            return;
        }
    }
    chooser.showXPlatformChooser(null, null, 'videoProcessorSource', document.getElementById('CalculateBitRateCheckBox').checked);
})

selectPreProcessedFileButton.addEventListener('click', () => {
    if (videoUploadInProgress || thumbnailUploadInProgress) { // @TODO check if meta data upload is in progress too, but that happens very fast
        if (confirm('video upload is already in progress; would you like to cancel and start a new upload?')) { // I don't think bitchute supports changing the upload on video
            upload_method.resetUploadValues();
        } else {
            return;
        }
    } 
    chooser.showXPlatformChooser(null, null, 'videoUploadSource');
})

chooseThumbnailButton.addEventListener('click', () => {
    chooser.showXPlatformChooser(null, null, 'thumbnailUploadSource'); // bitchute supports changing the thumbnail on the same upload code so this doesn't need checks
})

async function getPostingPath() {
    var postingLoc = undefined;
    if (document.getElementById('PostingLocationTextBox').value === '') {
        postingLoc = await upload_method.getUploadTokenResponse(true);
        if (postingLoc === '' || postingLoc == null) {
            alert(localUnableToGetPostingPath);
            return;
        }
    } return postingLoc;
}

document.addEventListener('loginEvent', (event) => {
    console.log(event.detail.message);
    curUserTb.value = event.detail.message;
    console.log(curUserTb);
    passwordTextBox.value = '';
})

document.addEventListener('logoutEvent', (event) => {
    clearOnLogout();
})

function clearOnLogout() {
    if (_vb_log) {
        console.log(event.detail.message);
        console.log(curUserTb);
    }
    postingLocationTextBox.value = '';
    writeToLogin('logged out');
    curUserTb.value = 'logged out';
}

uploadVideoButton.addEventListener('click', () => {
    initiateVideoUpload();
})

async function initiateVideoUpload() {
    if (global.processedVideoTextBox.value == '') {
        alert(localNoFileSelected); return;
    }
    if (postingLocationTextBox.value == '') {
        var toke = await upload_method.getUploadTokenResponse(true);
    }
    upload_method.uploadVideoData(postingLocationTextBox.value,
        processedVideoTextBox.value,
        csrfMiddleWareTokenTextBox.value,
        latestVideoUploadCode, 'video');
}

getInitialResponseButton.addEventListener('click', () => {
    getInitialResponseWithNet();
})

getUploadTokenButton.addEventListener('click', () => {
    getUploadTokenOnClick();
})

async function getUploadTokenOnClick() {
    if (document.getElementById('PostingLocationTextBox').value != '') {
        if (!confirm(
            'The video posting location is not blank.  Are you sure you want to cancel this upload' + '\n'
            + ' and get a new token?')) {
            return;
        } 
    }
    upload_method.getUploadTokenResponse();
}

loginButton.addEventListener('click', () => {
    upload_method.makeLoginRequest(userNameTextBox.value, passwordTextBox.value, csrfMiddleWareTokenTextBox.value, '');
})

logoutButton.addEventListener('click', () => {
    session_state.clearCookies();
    event_generation.raiseAnyEvent('logoutEvent');
})

document.addEventListener('newUiEvent', (event) => {
    writeToLogin(event.detail.message);
})

document.addEventListener('newProgressEvent', (event) => { // @TODO this needs to be redesigned
    if (event.detail.sendTo == 'csrfMiddleWareTokenTextBox') {
        csrfMiddleWareTokenTextBox.value = event.detail.data;
    }
})

document.addEventListener('uploadTokenEvent', (event) => {
    if (event.detail.data != undefined) {
        postingLocationTextBox.value = event.detail.data;
        writeToLogin(`got video auth path :` + '\n' + `${event.detail.data}`);
    }
})

document.getElementById('MakeADonationButton').addEventListener('click', () => {
    preventLinksFromOpeningInApp(true);
    shell.openExternal("https://www.bitchute.com/help-us-grow/");
})

document.getElementById('StopVideoProcessingButton').addEventListener('click', () => {
    vid_encoding.cancelVideoProcessing();
    videoProcessingInProgress = false;
})

document.addEventListener('uploadProgress', (event) => {
    var progBar = undefined;
    if (event.detail.type == 'video') {
        progBar = document.getElementById('VideoUploadProgressBar');
    } else if (event.detail.type == 'image') {
        progBar = document.getElementById('ThumbnailUploadProgressBar');
    }
    if (event.detail.success != undefined) {
        onVmStepComplete(event);
        return;
    } else if (event.detail.failure != undefined) {
        // @TODO handle failure
    }
    if (progBar == undefined) {
        return;
    }
    if (progBar.style.display == 'none') { progBar.style.display = 'inline'; }
    if (event.detail.percent != undefined) {
        progBar.value = event.detail.percent;
    } else {
        progBar.value = ((event.bytesSent/event.byteTotal)*100);
    }
    if (progBar.value >= 100) { 
        
    }
})

async function onVmStepComplete(progEvent, stepOverride, file) {
    if (stepOverride == 'videoFinishedEncoding') {
        videoProcessingInProgress = false;
        if (autoUploadAfterVideoFinishedProcessing || userRequestedVideoPostBeforeUpload) {
            var postloc = document.getElementById('PostingLocationTextBox').value;
            if (postloc == '') {
                postloc = await upload_method.getUploadTokenResponse(true); // if there's no posting location go get one
                if (postloc == '') {
                    writeToLogin('an error occured getting upload token, could not complete autoupload');
                    return;
                }
            }
            if (!videoUploadInProgress) {
                upload_method.uploadVideoData(postloc, file, csrfMiddleWareTokenTextBox.value, null, 'video');
            }
        }
    } else if (progEvent != undefined) {
        if (progEvent.detail.success) {
            if (progEvent.detail.type == 'image') {
                vm_video_thumbnail_finished = true;
            } else if (progEvent.detail.type == 'video') {
                vm_video_data_finished = true;
            } 
        }
        if (autoUploadAfterVideoFinishedProcessing) {
            var title = document.getElementById('TitleTextInput').value;
            var description = document.getElementById('DescriptionText').value;
            if (vm_video_thumbnail_finished && vm_video_data_finished) {
                if (title == '') {
                    alert('video must have a title, aborting autoupload. add a title then click post video'); //@TODO localize string
                    autoUploadAfterVideoFinishedProcessing = false;
                    document.getElementById('AutoPostVideoAfterProcessedCheckBox').checked = false;
                } else {
                    if (description == '') { description = 'None'; }
                    doPostVideoFinalized(
                        title,
                        description,
                        videoUploadContentRating,
                        document.getElementById('PublishNowCheckBox').checked);
                }
            } else if (vm_video_data_finished) {
                if (!thumbnailUploadInProgress) {
                    doThumbnailUpload(true);
                }
            } else if (vm_video_thumbnail_finished && userRequestedVideoPostBeforeUpload) {
                if (!videoUploadInProgress) {
                    if (processedVideoTextBox.value != '') {
                        upload_method.uploadVideoData(postingLocationTextBox.value,
                            processedVideoTextBox.value,
                            csrfMiddleWareTokenTextBox.value,
                            latestVideoUploadCode, 'video');
                    }
                }
            }
        }
    }
}

document.getElementById('AutoPostVideoAfterProcessedCheckBox').checked = autoUploadAfterVideoFinishedProcessing;

document.getElementById('AutoPostVideoAfterProcessedCheckBox').addEventListener('change', () => {
    autoUploadAfterVideoFinishedProcessing = document.getElementById('AutoPostVideoAfterProcessedCheckBox').checked;
})

// @TODO need Ray and/or Rich to setup a json object that the app will grab on startup
// right now this does nothing other than disable the encoder settings
// eventually the app gets a JSON object and sets the encoder settings
// it would be cool to give users with higher donation levels better video settings
// but also I know that depending on the server load the settings will change
document.getElementById('UseSiteEncoderSettingsCheckBox').checked = useSiteVideoEncodingSettings;

document.getElementById('UseSiteEncoderSettingsCheckBox').addEventListener('change', () => {
    useSiteVideoEncodingSettings = document.getElementById('UseSiteEncoderSettingsCheckBox').checked; 
})

//encoder options
document.getElementById('ProcessToVideoBitRateTextBox').value = videoEncoderSettingVideoBitrate.toString().replace('k', '');
document.getElementById('ProcessToAudioBitRateSelectBox').value = videoEncoderSettingAudioBitrate.toString().replace('k', '');
document.getElementById('VideoFormatSelectBox').value = videoEncoderSettingVideoFilters[0].options.toString();
document.getElementById('ProcessToVideoFpsSelectBox').value = videoEncoderSettingVideoFPS;

document.getElementById('VideoFormatSelectBox').addEventListener('change', () => {
    videoEncoderSettingVideoFilters[0].options = document.getElementById('VideoFormatSelectBox').value;
})

document.getElementById('ProcessToVideoBitRateTextBox').addEventListener('change', () => {
    videoEncoderSettingVideoBitrate = document.getElementById('ProcessToVideoBitRateTextBox').value + 'k';
})

document.getElementById('ProcessToAudioBitRateSelectBox').addEventListener('change', () => {
    videoEncoderSettingAudioBitrate = document.getElementById('ProcessToAudioBitRateSelectBox').value + 'k';
    
})

document.getElementById('ProcessToVideoFpsSelectBox').addEventListener('change', () => {
    videoEncoderSettingVideoFPS = document.getElementById('ProcessToVideoFpsSelectBox').value;
})

ptextOnChange = function processedFileTextBoxOnTextChange() {
    var source = document.getElementById('ProcessedFileTextBox').value;
    event_generation.raiseAnyEvent('uploadSourceChanged', '', source);
}

document.getElementById('ProcessedFileTextBox').onchange = ptextOnChange;

document.addEventListener('uploadSourceChanged', (event) => {
    if (event.detail.data === '') { // video source changed but no source
        document.getElementById('UploadVideoButton').disabled = 'disabled'; // disable the upload button because nothing to upload
    } else { // video source has changed with data
        document.getElementById('UploadVideoButton').disabled = undefined; // enable the upload button because we have a source
    }
})

document.getElementById('VideoContentRatingSelectBox').addEventListener('change', () => {
    if (document.getElementById('VideoContentRatingSelectBox').selectedIndex == 0) {
        videoUploadContentRating = 10;
    } else if (document.getElementById('VideoContentRatingSelectBox').selectedIndex == 1) {
        videoUploadContentRating = 40;
    } else if (document.getElementById('VideoContentRatingSelectBox').selectedIndex == 2) {
        videoUploadContentRating = 70;
    }
})

ttextOnChange = function thumbnailTextBoxOnChange() {
    event_generation.raiseAnyEvent('thumbnailSourceChanged');
}

document.getElementById('ThumbnailSourceText').onchange = ttextOnChange;

document.addEventListener('thumbnailSourceChanged', (event) => {
    if (autoUploadAfterVideoFinishedProcessing) { // only get an upload path if the autoupload box is checked
        if (document.getElementById('PostingLocationTextBox').value == '') { // if this isn't blank don't overwrite the path
            upload_method.getUploadTokenResponse();
        }
    }
})

uploadThumbnailButton.addEventListener('click', () => {
    doThumbnailUpload();
})

async function doThumbnailUpload(autoUploadCalled) {
    if (global.thumbnailSourceTextBox.value == '' || !global.thumbnailSourceTextBox.value) {
        if (autoUploadCalled) {
            alert('no thumbnail was available so autoupload was unable to continue.  please finish the upload manually.');
            document.getElementById('AutoPostVideoAfterProcessedCheckBox').checked = false;
            autoUploadAfterVideoFinishedProcessing = false;
        } else {
            alert(global.localNoFileSelected);
        }
         return;
    } if (document.getElementById('PostingLocationTextBox').value === '') {
        var postingLoc = await upload_method.getUploadTokenResponse(true);
        if (postingLoc === '' || postingLoc == null) {
            alert(localUnableToGetPostingPath);
            return;
        }
    } 
    upload_method.uploadVideoData(
        postingLocationTextBox.value,
        thumbnailSourceTextBox.value,
        csrfMiddleWareTokenTextBox.value,
        latestVideoUploadCode, 'image');
}

document.addEventListener('postingVideoFinalized', (event) => {
    if (event.detail.success) {
        onVideoSuccessfullyPosted(event.detail.data);
    } else if (event.detail.failure) {
        
    }
})

function onVideoSuccessfullyPosted(uploadData) {
    if (uploadData != undefined) {
        var successMessage = `>>posted ${uploadData.uploadTitle} successfully @ ${uploadData.uploadUrl}<<`;
        if (!document.getElementById('PublishNowCheckBox').checked) {
            successMessage += '\n' + '\n' + 'this upload was not marked for immediate publication so you will need' +
                ` to login on bitchute.com and publish for the video to be publicly viewable`;
        }
        writeToSuccessfulUploadTextBox(successMessage);
        writeToLogin('video successfully posted');
    }
    resetValuesOnUploadProgressFinished(true);
}

function writeToSuccessfulUploadTextBox(uploadRemotePath) {
    document.getElementById('SuccessfulUploadListBox').value += uploadRemotePath + '\n';
}

function resetValuesOnUploadProgressFinished(success) {
    if (success) {
        document.getElementById('ProcessedFileTextBox').value = '';
        document.getElementById('TitleTextInput').value = ''
        document.getElementById('DescriptionText').value = ''
        document.getElementById('ThumbnailSourceText').value = ''
        document.getElementById('ProcessedFileTextBox').value = ''
        document.getElementById('PostingLocationTextBox').value = ''
        document.getElementById('VideoUploadProgressBar').value = 0;
        document.getElementById('VideoUploadProgressBar').style.display = 'none';
        document.getElementById('VideoHashtagsTextBox').value = '';
        if (!videoProcessingInProgress) {
            document.getElementById('VideoProcessorSourceTextBox').value = ''
            document.getElementById('VideoProcessorProgressBar').value = 0;
            document.getElementById('VideoProcessorProgressBar').style.display = 'none';
        }
        document.getElementById('ThumbnailUploadProgressBar').value = 0;
        document.getElementById('ThumbnailUploadProgressBar').style.display = 'none';
    }
    vm_video_data_finished = false;
    vm_video_meta_data_finished = false;
    vm_video_thumbnail_finished = false;
    userRequestedVideoPostBeforeUpload = false;
    upload_method.resetUploadValues();
    setAutoUpload(false);
}

document.addEventListener('videoProcessingEvent', (event) => {
    if (event.detail.data != null) {
        videoProcessorProgressBar.value =
            parseFloat(((
                convertTimeStampToSeconds(
                    event.detail.data.data.timemark) / event.detail.data.data.vlength)
                * 100).toString().substring(0, 4)); return;
    } else if (event.detail.path != null) {
        diag.writeToDebug(localVideoFinishedProcessing + ' @ ' + event.detail.path);
        processedVideoTextBox.value = event.detail.path;
        onVmStepComplete(null, 'videoFinishedEncoding', event.detail.path);
    } else if (event.detail.started != null) {
        videoProcessingInProgress = true;
        videoProcessorProgressBar.style.display = 'inline';
        document.getElementById('StopVideoProcessingButton').style.display = 'inline';
    } else if (event.detail.error != null) {
        videoProcessingInProgress = false;
        videoProcessorProgressBar.style.display = 'none';
        document.getElementById('StopVideoProcessingButton').style.display = 'none';
    } if (event.detail.success) {
        document.getElementById('StopVideoProcessingButton').style.display = 'none';
    }
})

function convertTimeStampToSeconds(t) {
    try {
        var tmA = t.toString().split(':');
        var sc = (tmA[0] * 3600) + (tmA[1] * 60) + (parseFloat(tmA[2]))
    } catch (ex) { diag.writeToDebug(ex.message) }
    return sc;
}

document.getElementById('PostVideoFinalButton').addEventListener('click', () => {
    if (!validateInputs()) {
        return;
    }
    if (videoUploadContentRating == undefined) {
        videoUploadContentRating = 10;
    }
    if (videoProcessingInProgress) {
        userRequestedVideoPostBeforeUpload = true;
    }
    if (vm_video_data_finished && vm_video_thumbnail_finished) {
        doPostVideoFinalized(document.getElementById('TitleTextInput').value,
            document.getElementById('DescriptionText').value,
            videoUploadContentRating,
            document.getElementById('PublishNowCheckBox').checked);
    }
    if (vm_video_data_finished || vm_video_thumbnail_finished) {
        userRequestedVideoPostBeforeUpload = true;
    }
    if (!vm_video_data_finished && !vm_video_data_finished) {
        if (!videoUploadInProgress && !thumbnailUploadInProgress) {
            setAutoUpload(true);
            initiateVideoUpload();
        } else if (thumbnailUploadInProgress) {
            userRequestedVideoPostBeforeUpload = true;
            setAutoUpload(true);
        } else if (videoUploadInProgress) {
            setAutoUpload(true);
        }
    } else if (vm_video_data_finished && !vm_video_thumbnail_finished) {
        doThumbnailUpload();
    } else if (!vm_video_data_finished && vm_video_thumbnail_finished) {
        if (!videoUploadInProgress) {
            setAutoUpload(true);
            initiateVideoUpload();
        } else {
            setAutoUpload(true);
        }
    } 
})

function validateInputs() {
    if (document.getElementById('TitleTextInput').value == '') {
        alert('cannot post video with blank title');
        return false;
    }
    if (document.getElementById('ThumbnailSourceText').value == '') {
        alert('no thumbnail file was selected');
        return false;
    }
    if (document.getElementById('ProcessedFileTextBox').value == '') {
        alert('no video file was selected');
        return false;
    }
    return true;
}

function setAutoUpload(enabled) {
    autoUploadAfterVideoFinishedProcessing = enabled;
    document.getElementById('AutoPostVideoAfterProcessedCheckBox').checked = enabled;
}

async function doPostVideoFinalized(title, description, contentRating, publishNow) {
    if (contentRating != undefined) {
        videoUploadContentRating = contentRating;
    }
    if (publishNow == undefined) {
        publishNow = document.getElementById('PublishNowCheckBox').checked;
        if (publishNow == undefined) {
            publishNow = false;
        }
    }
    var urlStringParts = '';
    if (!vm_video_data_finished) {
        alert(localUnableToPostNoVideoData);
        return;
    } if (!vm_video_thumbnail_finished) {
        alert(localUnableToPostNoThumbnail);
        return;
    } if (title == undefined || title == '') {
        alert('title is missing, cannot post');
        return;
    } if (description == undefined || description == '') {
        description = 'Processed and uploaded with BitChute electronjs opensource video processor';
    } if (postingLocationTextBox.value != '') {
        urlStringParts = postingLocationTextBox.value.split('&');
        var jsonMetaData = upload_method.getJsonMetaData(
            csrfMiddleWareTokenTextBox.value,
            title,
            description,
            latestVideoUploadCode,
            urlStringParts[urlStringParts.length - 2],
            urlStringParts[urlStringParts.length - 1],
            contentRating,
            publishNow
        );
        var jsonMetaDataVideoDetails = upload_method.getJsonMetaDataForVideoDetail(
            csrfMiddleWareTokenTextBox.value,
            title,
            description,
            document.getElementById('VideoHashtagsTextBox').value,
            document.getElementById('VideoCategorySelectBox').value,
            contentRating,
            'on'
        );
        var metaPackage = {
            jsonMeta: jsonMetaData,
            jsonMetaVideoDetails: jsonMetaDataVideoDetails
        };
        upload_method.uploadVideoData(postingLocationTextBox.value,
            null,
            null,
            null,
            'meta',
            metaPackage);
    } if (postingLocationTextBox.value == '') {
        alert('an error occured: missing posting path on finalize');
    } else if (urlStringParts == '') {
        alert(localUnableToGetPostingPath);
    }
}


//shell is missing so this doesn't work

//var toggleInAppBrowserOverride = function (event) { 
//    event.preventDefault();
//    shell.openExternal(this.href);
//}

//$(document).ready(() => {
//    var preventLinksFromOpeningInApp = function (openExternal) {
//        try {
//            if (openExternal) {
//                $(document).on('click', 'a[href^="http"]', toggleInAppBrowserOverride);
//            } else {
//                $(document).onclick -= toggleInAppBrowserOverride;
//            }
//            console.log(`toggled links opening in app to${openExternal}`)
//        } catch{ }
//    }
//})
