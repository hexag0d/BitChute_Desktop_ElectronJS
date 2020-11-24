var diag = require('./diagnostic.js')
const path = require('path')

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
	encodeFile
}

function encodeFile(file_path) {
	try {
		const { ext, name, dir } = path.parse(file_path)
        var rndId = Math.floor((Math.random() * 10000000000) + 1);
        var vl = undefined; // total video length
        const proc = ffmpeg(file_path)
            .on('codecData', function (data) {
                vl = convertTimeStampToSeconds(data.duration); // get the total video length
                diag.writeToDebug(vl);
                diag.writeToDebug(data);
                diag.writeToDebug(global.localProcessingVideo + '... ');
                videoProcessorProgressBar.style.display = 'inline'; // @TODO move into view models
            })
            .on('end', function () {
                var _new_path = `${dir}/${name}_${rndId}${ext}`;
                onVideoFinishedProcessing(_new_path);
            })
            .on('error', function (err) {
                videoProcessorProgressBar.style.display = 'none';
                diag.writeToDebug(global.localGeneralError + err.message);
            })
            .on('progress', function ({ timemark }) {
                videoProcessorProgressBar.value = // @TODO move into view models
                    parseFloat(((convertTimeStampToSeconds(timemark) / vl)
                        * 100).toString().substring(0, 4));
            })
            .size(videoEncoderSettingResolution) 
            .audioBitrate(videoEncoderSettingAudioBitrate)
            .videoBitrate(videoEncoderSettingVideoBitrate)
		.save(`${dir}/${name}_${rndId}${ext}`)
    } catch (error) {
        videoProcessorProgressBar.style.display = 'none';
        diag.writeToDebug(error.message);
	}
}

function convertTimeStampToSeconds(t) {
    var sc = undefined;
    try {
        var tmA = t.toString().split(':');
        sc = (tmA[0] * 3600) + (tmA[1] * 60) + (parseFloat(tmA[2]))
    } catch (ex) { diag.writeToDebug(ex.message) }
    return sc;
}

function onVideoFinishedProcessing(vidPath) {
    diag.writeToDebug(global.localVideoFinishedProcessing + ' @ ' + vidPath);
    videoProcessorProgressBar.style.display = 'none';
    global.processedVideoTextBox.value = vidPath; // @TODO put this into an event handler
}
