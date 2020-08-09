



//ipc.on(event_keys.GET_VIDEO_INPUT_PATH, function (event, filePath) {
//    console.log(filePath)
//    try {
//        const { ext, name, dir } = path.parse(filePath)
//        var rndId = Math.floor((Math.random() * 10000000000) + 1);
//        const proc = ffmpeg(filePath)
//            .on('codecData', function (data) {
//                console.log(data);
//            })
//            .on('end', function () {
//                var newPath = `${dir}/${name}_${rndId}${ext}`;
//            })
//            .on('error', function (err) {
//                console.log('an error happened: ' + err.message);
//            })
//            .on('progress', function ({ progress }) {
//                console.log('progress percent: ' + progress);
//            })
//            .size('854x480')
//            .audioBitrate('96k')
//            .videoBitrate('213k')
//            .save(`${dir}/${name}_${rndId}${ext}`)
//    } catch (error) {

//        alert(error);
//    }
//})