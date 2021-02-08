diag = require('./diagnostic.js')
const path = require('path')

ffmpeg = require('fluent-ffmpeg');
ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked'); // for debug 'npm start' remove .replace
                                                                  // this is only tested on windows 
                                                                  // without replace app is throwing a missing ffmpeg.exe error

ffmpeg.setFfmpegPath(ffmpegPath);

var event_generation = require('../vm/event_generators.js');

module.exports = {
    encodeFile,
    cancelVideoProcessing
}

if (debugLocalApp) {

    ffmpeg.getAvailableFormats(function (err, formats) {
        console.log('Available formats:');
        console.dir(formats);
    });

    ffmpeg.getAvailableCodecs(function (err, codecs) {
        console.log('Available codecs:');
        console.dir(codecs);
    });

    ffmpeg.getAvailableEncoders(function (err, encoders) {
        console.log('Available encoders:');
        console.dir(encoders);
    });

    ffmpeg.getAvailableFilters(function (err, filters) {
        console.log("Available filters:");
        console.dir(filters);
    });

}

proc = undefined;

function encodeFile(file_path) {
	try {
		var { ext, name, dir } = path.parse(file_path)
        var rndId = Math.floor((Math.random() * 99998) + 1);
        if (name.length > 5) { // trim long filenames otherwise the upload will 404 after POST
            name = name.substring(0, 5);
        }
        var vl = undefined; // total video length
        proc = undefined;
        proc = ffmpeg(file_path)
            .on('codecData', function (data) {
                vl = convertTimeStampToSeconds(data.duration); // get the total video length
                diag.writeToDebug(vl);
                diag.writeToDebug(data);
                diag.writeToDebug(global.localProcessingVideo + '... ');
                onVideoEncodingProgress(null, null, true);
            })
            .on('end', function () {
                var _new_path = `${dir}/${name}_${rndId}${videoEncoderOutputExtension}`;
                onVideoEncodingProgress(null, null, null, _new_path);
            })
            .on('error', function (err) {
                diag.writeToDebug(global.localGeneralError + err.message);
                videoProcessedAndAwaitingUpload = false;
            })
            .on('progress', function ({ timemark }) {
                onVideoEncodingProgress(timemark, vl);
            })
            .videoFilters(videoEncoderSettingVideoFilters)
            //.videoCodec('mpeg4') // testing if this increases or decreases the quality
            .audioBitrate(videoEncoderSettingAudioBitrate)
            .videoBitrate(videoEncoderSettingVideoBitrate, [true, true]) //constant bitrate seems to look better 
            .fps(videoEncoderSettingVideoFPS)
            .save(`${dir}/${name}_${rndId}${videoEncoderOutputExtension}`)
    } catch (error) {
        onVideoEncodingProgress(null, null, null, true, error);
        diag.writeToDebug(error.message);
    }
}

function cancelVideoProcessing() {
    proc.ffmpegProc.kill();
    proc = undefined;
    diag.writeToDebug('video processing cancelled at user request');
}

videoProcessedAndAwaitingUpload = undefined;

function onVideoEncodingProgress(timemark, vlength, started, path, error) {
    if (timemark != null) {
        event_generation.raiseNewVideoProcessingEvent(null, null, {
            data: {
                timemark: timemark,
                vlength: vlength
            }
        });
    } else if (started != null) {
        event_generation.raiseNewVideoProcessingEvent(null, null, null, null, null, null, true);
    } else if (path != null || error != null) {
        if (error == null) { // successfully encoded video
            event_generation.raiseNewVideoProcessingEvent(null, null, null, null, true, path);
            if (videoProcessedAndAwaitingUpload == undefined) {
                videoProcessedAndAwaitingUpload = path;
            }
        } else {
            event_generation.raiseNewVideoProcessingEvent(null, null, null, error);
        }
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
