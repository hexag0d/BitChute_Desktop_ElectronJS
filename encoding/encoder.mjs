export function uEncodeVideos(paths) {
    console.log(paths)
    try {
        const { ext, name, dir } = path.parse(paths)
        var rndId = Math.floor((Math.random() * 1000000) + 1);
        const proc = ffmpeg(filePath)
            .on('codecData', function (data) {
                console.log(data);
            })
            .on('end', function () {
                console.log('file has been converted succesfully');
            })
            .on('error', function (err) {
                console.log('an error happened: ' + err.message);
            })
            .on('progress', function ({ percent }) {
                console.log('progress percent: ' + percent);
            })
            .size('854x480')
            .audioBitrate('96k')
            .videoBitrate('213k')
            .save(`${dir}/${name}_${rndId}${ext}`)
    } catch (error) {
        alert(error)
    }
}