/*
 * Global settings file, not used much at the moment
 * but may eventually prove useful @hexagod
 */

//bitchute.com settings

var userDonationSupportLevel = 'none';

// end bitchute settings

//begin video settings 
//$(document).ready(() => {
//    document.addEventListener('videoEncoderSettingChanged', onVideoEncoderSettingChanged);
//});

//function onVideoEncoderSettingChanged(event) {

//}

videoEncoderSettingResolution = '854x480'; 

videoEncoderSettingAudioBitrate = '96k';
videoEncoderSettingVideoBitrate = '213k';

supportedVideoTypes = 'avi', 'mov', 'mp4'; //there are probably more, but just for now

//end video settings  

//begin app settings 

/**
 * if no arg passed returns the current setting
 * @param {any} toggleOn toggle verbose logging on and off
 */
function _vblg(toggleOn) {
    if (toggleOn == undefined) {
        return _v_lgng;
    }
}

//should app log with verbosity, disable this on release
var _v_lgng = true; // I made var name shorter because it'll get queried a lot
                    // unlike c# I think having a bunch of long var names slows down the app?
                    // maybe not?  you tell me @hexagod
                

appLanguageSetting = 'eng'; 

//end app only settings 

