/*
 * Global settings
 * 
 * 
 */


//bitchute.com settings-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

token = 'test'; 

// end bitchute settings-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

//begin axios settings-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

axiosConfig = {
    headers: {
        'Content-Type' : 'multipart/form-data',
        Authorization: `Bearer ${global.token}`,
        //"Access-Control-Allow-Origin": "*",
    }
}

//end axios settings-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


//begin video settings -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

videoEncoderSettingResolution = '854x480';
videoEncoderSettingAudioBitrate = '96k';
videoEncoderSettingVideoBitrate = '213k';

//end video settings  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

