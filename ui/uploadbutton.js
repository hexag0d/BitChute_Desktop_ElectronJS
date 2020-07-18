//import { uEncodeVideos } from './encoding/encoder.mjs';

var uploadOnClick = function () {
    $('#uploadButton')[0].value = 'processing...'
    $('#debugareatext')[0].value = $('#videoInput')[0].files[0].path
    //uEncodeVideos()
}
$('#uploadButton').on('click', uploadOnClick)