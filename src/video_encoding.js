diag = require('./diagnostic.js')
const path = require('path')

ffmpeg = require('fluent-ffmpeg');
ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// FOR RELEASE ONLY UNCOMMENT:
ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked'); // for debug 'npm start' remove .replace
                                                                  // this is only tested on windows 
                                                                  // without replace app is throwing a missing ffmpeg.exe error


ffmpeg.setFfmpegPath(ffmpegPath);

var event_generation = require('../vm/event_generators.js');

module.exports = {
    encodeFile,
    cancelVideoProcessing,
    getVideoFileLength
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

vidLength = undefined;

function calculateMaximumBitRatesForFileSize(fileLength, desiredMaxSizeInMegaBytes, desiredAudioBitRate, desiredMaxVideoBitRate) {
    var newVideoKBitRate = 0;
    var totalAudioKBits = fileLength * (desiredAudioBitRate / 1000);
    var totalVideoKBits = 0;
    var desiredMaxSizeInKBits = desiredMaxSizeInMegaBytes * 1000/*KB*/ * 8/*Kb*/;
    if (desiredMaxVideoBitRate != null) {
        totalVideoKBits = ((fileLength * desiredMaxVideoBitRate) * 8) + (desiredAudioBitRate / 1000);
        if (totalVideoKBits <= desiredMaxSizeInKBits) {
            newVideoKBitRate = desiredMaxVideoBitRate;
        } else {
            var kBitsAvailableForVideo = desiredMaxSizeInKBits - totalAudioKBits;
            newVideoKBitRate = Math.round(kBitsAvailableForVideo / fileLength);
        }
        if (newVideoKBitRate > desiredMaxVideoBitRate) {
            newVideoKBitRate = desiredMaxVideoBitRate;
        }
        event_generation.raiseAnyEvent('onBitRateCalculationFinished', null, {
            videoBitRate: newVideoKBitRate,
            audioBitRate: desiredAudioBitRate
        })
        return {
            videoBitRate: newVideoKBitRate,
            audioBitRate: desiredAudioBitRate
        }
    } else {
        totalVideoKBits = ((desiredMaxSizeInMegaBytes * 8) * 1000 * fileLength) - (desiredAudioBitRate * fileLength);
        var newVideoKBitRate = totalVideoKBits / fileLength;
        newVideoKBitRate = Math.round(newVideoKBitRate);
        diag.writeToDebug(`calc video bitrate = ${newVideoKBitRate}k`);
        diag.writeToDebug(`for desired audio bitrate ${desiredAudioBitRate}`);
        event_generation.raiseAnyEvent('onBitRateCalculationFinished', null, {
            videoBitRate: newVideoKBitRate,
            audioBitRate: desiredAudioBitRate
        })
        return {
            videoBitRate: newVideoKBitRate,
            audioBitRate: desiredAudioBitRate
        }
    }
}

function getVideoFileLength(file_path, calculateBitRates, desiredFileSizeInMB, audioBitRate, desiredMaxVideoBitRate) {
    try {
        var { ext, name, dir } = path.parse(file_path)
        var rndId = Math.floor((Math.random() * 99998) + 1);
        if (name.length > 5) { // trim long filenames otherwise the upload will 404 after POST
            name = name.substring(0, 5);
        }
        var tempFile = `${dir}/${name}_${rndId}${videoEncoderOutputExtension}`;
        proc = undefined;
        proc = ffmpeg(file_path)
            .on('codecData', function (data) {
                if (debugLocalApp) {
                    console.log(data);
                }
                vidLength = convertTimeStampToSeconds(data.duration); // get the total video length
                calculateMaximumBitRatesForFileSize(vidLength, desiredFileSizeInMB, audioBitRate, desiredMaxVideoBitRate);
                cancelVideoProcessing(true);
                encodeFile(file_path);
            })
            .on('end', function () {
            })
            .on('error', function (err) {

            })
            .on('progress', function ({ timemark }) {

            })
            .audioBitrate(videoEncoderSettingAudioBitrate)
            .videoBitrate(videoEncoderSettingAudioBitrate, [true, true])
            .save('_tempProbe.mp4')
    } catch (error) {
        //diag.writeToDebug(error);
    }
}

fpath = undefined;

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

function cancelVideoProcessing(doNotNotify) {
    proc.ffmpegProc.kill();
    proc = undefined;
    if (!doNotNotify) {
        diag.writeToDebug('video processing cancelled at user request');
    }
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
