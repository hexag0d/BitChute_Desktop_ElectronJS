/*
 * Global settings file, not used much at the moment
 * but may eventually prove useful @hexagod
 */

debugLocalApp = false;
//bitchute.com settings


module.exports = {
    _vblg,
    getAppLanguageSetting,
    debugLocalApp,
    setAudioBitRate
}

userDonationSupportLevel = 'none';

// end bitchute settings

//begin video settings 

videoEncoderSettingVideoFilters = [
    {
     filter: 'scale',
     options: '-2:480'
    },
    {
     filter: 'format',
     options: 'yuv420p'
    }
];

videoEncoderSettingAudioBitrate = '96k'; // @TODO eventually need to just get rid of the k value and use only int

function setAudioBitRate(videoEncoderSettingAudioBitrateNew) {
    videoEncoderSettingAudioBitrate = videoEncoderSettingAudioBitrateNew;
}

setAudioBitRate(videoEncoderSettingAudioBitrate);

videoEncoderSettingVideoBitrate = '288k';
videoEncoderSettingVideoFPS = '30';

videoEncoderOutputExtension = '.mp4';

supportedVideoTypes = 'avi', 'mov', 'mp4'; //there are probably more, but just for now

//end video settings  

//begin app settings 
useSiteVideoEncodingSettings = false;

/**
 * if no arg passed returns the current setting
 * @param {any} toggleOn toggle verbose logging on and off
 */
function _vblg(toggleOn) {
    if (toggleOn == undefined) {
        return _vb_log;
    }
}

/*
 * verbose logging defaults to the state of "debugLocalApp"
 * debug local app setting is more for programmatic forks versus logging changes
 */
_vb_log = debugLocalApp; // vebose logging enabled, need to put all of the console.log behind this bool

                
function getAppLanguageSetting() {
    return appLanguageSetting;
}

appLanguageSetting = 'eng'; 

//end app only settings 

