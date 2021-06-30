/**
 * This file contains login and upload methods
 * It uses superagent because axios won't let me
 * override the referer and other headers
 * 
 * Superagent seems to be working well.  
 * 
 * @TODO - hexagod
 * 
 * Need Ray and/or Rich to add a static json file
 * that the app will retrieve when getting the video token
 * This will ensure that we're encoding with their predefined
 * params
 * 
 * Add batch uploading for bitchute.com donors
 * 
 * This file needs to get split up between login and upload
 * methods since they really shouldn't share a code file
 * 
 * The UI needs to get separated from the business logic
 * 
 * There's also a bunch of static vars that need to get turned
 * into a class OR preferably removed 
 * part of the reason I'm using the stat vars atm is to inspect 
 * the variables easily in console while I work this process
 * out

 this will already encode and post videos, but the process
 needs streamlining and more n00b guards along the way
 user can already process and upload videos to bitchute, but
 gotta be the right order of button pushing and also none
 of the server length restrictions IE for text length on the
 title are checked before posting
 * */

//framework
//const axios = require('axios').default; //@TODO remove axios

const electron = require('electron');
const net = electron.remote.net;

const session_state = require('./session_state.js');

const FormData = require('form-data');
const querystring = require('querystring');
const https = require('https');
const superagent = require('superagent');
const event_generation = require('../vm/event_generators.js');
const settings = require('../settings.js');

var vblog = require('../settings.js')._vblg;

var diag = require('./diagnostic.js')
var endpoints = require('./endpoints.js')
const fs = require('fs')

module.exports = {
    getUploadTokenResponse,
    uploadVideoData,
    getJsonMetaData,
    resetUploadValues,
    generateCompletedUploadUrl,
    makeLoginRequest,
    getInitialResponseWithNet,
    getJsonMetaDataForVideoDetail
}


function createDocument(html) {
    var doc = document.implementation.createHTMLDocument('new doc');
    doc.documentElement.innerHTML = html;
    return doc;
}


//I think a lot of these can and should be deleted now
//I was using them to develop the POST process but
//now they're just taking up space.
// I'm short on time so leaving here for now
responseDocument = undefined;
responseBody = undefined;
requestHeaders = undefined;
responseHeaders = undefined;
responseCookie = undefined;
csrfMiddleWareToken = undefined;
initialDoc = undefined;
initialDocStore = undefined;
requestChunk = '';
axiosInstance = undefined;
request = undefined;
stat_agent = undefined;
staticResponse = undefined;

async function getInitialResponseWithNet(shouldAwaitResponse) {
    stat_agent = superagent.agent();
    event_generation.createNewUiEvent('getting initial web response');
    var cookies = await session_state.getCookiesFromSession(true, stat_agent, true);
    initialDoc = undefined;
    request = stat_agent.get('https://www.bitchute.com/')
        .set('Host', 'www.bitchute.com')
        //.set('X-Requested-With', 'XMLHttpRequest')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0')
        .buffer(true)
        .withCredentials()
    console.log(request);
    if (shouldAwaitResponse) {
        staticResponse = await request;
        console.log(staticResponse.res.headers['set-cookie']);
        console.log(staticResponse.res.status);
        initialDoc = createDocument(staticResponse.res.text);
        console.log(staticResponse.res.text);
        responseCookie = staticResponse.res.headers['set-cookie'];
        session_state.saveAllCookiesFromSetCookie(responseCookie);
        csrfMiddleWareTokenTextBox.value = initialDoc.getElementsByTagName('input').csrfmiddlewaretoken.value; // @TODO move into VM
        if (staticResponse.res.statusCode == 200) {
            event_generation.createNewUiEvent('got objects from site');
            if (initialDoc != null || undefined) {
                try {
                    for (i = 0; i < initialDoc.getElementsByClassName('dropdown-item spa').length; i++) {
                        if (initialDoc.getElementsByClassName('dropdown-item spa')[i].innerText == 'Profile') {
                            var p = i + 1;
                            event_generation.raiseAnyEvent('loginEvent', initialDoc.getElementsByClassName('dropdown-item spa')[p].innerText);
                            console.log(p);
                            return;
                        }
                    }
                }
                catch (err) {
                    console.log(err.message);
                }
            }
        }
    } else {
        request.then((res) => {
            console.log(res.headers);
            console.log(res.text);
            console.log(res.status);
            initialDoc = createDocument(res.text);
            responseCookie = res.headers['set-cookie'];
            session_state.saveAllCookiesFromSetCookie(responseCookie);
            csrfMiddleWareTokenTextBox.value = initialDoc.getElementsByTagName('input').csrfmiddlewaretoken.value; // @TODO move to VM
            if (res.status === 200) {
                event_generation.createNewUiEvent('got objects from site');
            }
        }).catch((err) => { console.log(err.message); });
    }
} // catch Uncaught (in promise) Error: getaddrinfo ENOTFOUND www.bitchute.com = no internet

getInitialResponseWithNet(true);

async function makeLoginRequest(username, password, csrfmiddlewaretoken, onetimecode) {
    event_generation.createNewUiEvent(`making login attempt`);
    initialDocStore = createDocument(requestChunk);
    console.log(csrfmiddlewaretoken);
    request = undefined;
    request = stat_agent.post('https://www.bitchute.com/accounts/login/')
        .set('Referer', 'https://www.bitchute.com/')
        .set('Accept-Encoding', 'gzip, deflate, br')
        .set('Origin', 'https://www.bitchute.com')
        .set('Host', 'www.bitchute.com')
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Accept', '*/*')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0')
        .withCredentials()
        .send(getLoginFormDataString(username, password, csrfmiddlewaretoken, onetimecode))
        .buffer(true)
    console.log(request);
    request.then((res) => {
        console.log(res.text);
        console.log(res.status);
        console.log(res.headers);
        staticResponse = res;
        responseCookie = res.headers['set-cookie'];
        session_state.saveAllCookiesFromSetCookie(responseCookie);
        if (res.text.match('"errors": "None"')) {
            event_generation.createNewUiEvent(`logged in as ${username}`);
            event_generation.raiseAnyEvent(`loginEvent`, `${username}`);
        }
    }).catch((err) => {
        console.log(err);
        console.log(err.message);
        console.log(err.response);
        event_generation.createNewUiEvent(`error ${err.message} making login attempt`);
    });
}

function getLoginFormDataString(username, password, csrfmiddlewaretoken, onetimecode) {
    var formDataString = `csrfmiddlewaretoken=${csrfmiddlewaretoken}` + '&';
    formDataString += `username=${username}` + '&';
    formDataString += `password=${password}` + '&';
    formDataString += `one_time_code=${onetimecode}`;
    return formDataString;
}

uploadToken = '';
uploadLocation = '';

uploadTokenRequest = undefined;
initialVideoIdResponse = undefined;
upTokenReq = undefined;
upVidReq = undefined;
uploadVideoRequest = undefined;
uploadTokenResponse = undefined;
upVidReqResponseBody = undefined;

latestVideoUploadCode = '';
latestVideoUploadChannelId = '';
latestVideoUploadCdid = '';
latestVideoUploadCid = '';
latestVideoUploadDomainPath = '';
latestVideoUploadFullyQualifiedUrl = '';
latestVideoUploadCsrfToken = '';

uploadTokenRequestInProgress = false;
videoUploadInProgress = false;
thumbnailUploadInProgress = false;
metaUploadInProgress = false;
videoUploadContentRating = 10;

async function getUploadTokenResponse(returnToken) {
    upTokenReq = undefined;
    if (!uploadTokenRequestInProgress) {
        if (videoUploadInProgress || thumbnailUploadInProgress) {
            alert(`a video or image upload is already in progress`);
        }
        event_generation.createNewUiEvent('getting upload token response');
        upTokenReq = stat_agent.get('https://www.bitchute.com/myupload/');
        if (!settings.debugLocalApp) { uploadTokenRequestInProgress = true; }
        uploadTokenRequest = upTokenReq;
        upTokenReq.buffer(true).withCredentials()
            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            .set('Host', 'www.bitchute.com')
            .set('Accept-Encoding', 'gzip, deflate, br')
            .set('Referer', 'https://www.bitchute.com/')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0')
            .set('Connection', 'keep-alive')
            .redirects(2);
        if (_vb_log) { console.log(upTokenReq); }
        if (!returnToken) {
            upTokenReq.then((res) => {
                uploadTokenRequestInProgress = false;
                uploadTokenResponse = res.headers;
                try {
                    console.log(res.headers);
                    console.log(upTokenReq.response.headers["location"]);
                    console.log(upTokenReq.response.headers);
                } catch{ }
                try {
                    console.log(res.status);
                    console.log(res.text);
                } catch { }
                try {
                    console.log(res.headers);
                } catch (err) {
                    if (_vb_log) {
                        console.log(res);
                        console.log(err);
                    }
                    event_generation.createNewUiEvent(`error ${err} getting upload token web response`);
                }
                latestVideoUploadCsrfToken = createDocument(res.text)
                    .getElementById('fileupload').getAttribute('data-form-data').split('\"')[3];
                event_generation.createNewUiEvent(`got upload token response for ${uploadLocation}`);
                if (upTokenReq.url != null) {
                    event_generation.raiseAnyEvent('uploadTokenEvent', null, upTokenReq.url);
                    getUploadCodesFromUrlString(upTokenReq.url);
                }
                if (latestVideoUploadCsrfToken != '') {
                    event_generation.raiseNewProgressEvent(latestVideoUploadCsrfToken, 'csrfMiddleWareTokenTextBox');
                }
            }).catch((err) => {
                uploadTokenRequestInProgress = false;
                console.log(err);
            });
        } else {
            var res = await upTokenReq;
            uploadTokenRequestInProgress = false;
            uploadTokenResponse = res.headers;
            try {
                console.log(res.headers);
                console.log(upTokenReq.response.headers["location"]);
                console.log(upTokenReq.response.headers);
            } catch{ }
            try {
                console.log(res.status);
                console.log(res.text);
            } catch { }
            try {
                console.log(res.headers);
            } catch (err) {
                event_generation.createNewUiEvent(`error ${err} getting upload token web response`);
            }
            latestVideoUploadCsrfToken = createDocument(res.text)
                .getElementById('fileupload').getAttribute('data-form-data').split('\"')[3];
            event_generation.createNewUiEvent(`got upload token response for ${uploadLocation}`);
            if (upTokenReq.url != null) {
                event_generation.raiseAnyEvent('uploadTokenEvent', null, upTokenReq.url);
                getUploadCodesFromUrlString(upTokenReq.url);
            }
            if (latestVideoUploadCsrfToken != '') {
                event_generation.raiseNewProgressEvent(latestVideoUploadCsrfToken, 'csrfMiddleWareTokenTextBox');
            }
            return upTokenReq.url;
        }
    }
    if (upTokenReq != undefined && _vb_log) {
        console.log(upTokenReq);
    }
}

function getUploadCodesFromUrlString(qString) {
    latestVideoUploadFullyQualifiedUrl = qString;
    var urlSplit = qString.split(`?`);
    latestVideoUploadDomainPath = urlSplit[0];
    qString = urlSplit[1];
    latestVideoUploadCode = qString.split('&')[0].split('=')[1];
    console.log(latestVideoUploadCode);
    latestVideoUploadChannelId = qString.split('&')[1].split('=')[1];
}

staticVideoUploadResult = undefined;
staticJsonMetaPackage = undefined;

function uploadVideoData(uploadEndpointUrl, localFilePath, csrfmwtoken, uploadcode, uploadType, metapackage, remoteVideoPath) {
    if (uploadType == 'video' && videoUploadInProgress) {
        alert('video upload is already in progress');
        return;
    } else if (uploadType == 'image' && thumbnailUploadInProgress) {
        alert('thumbnail (image) upload is already in progress');
        return;
    }
    var simpleEndpoint = uploadEndpointUrl.split('?upload')[0];
    if (metapackage != undefined) {
        simpleEndpoint = simpleEndpoint.split('/upload/')[0];
    }
    var evType = 'uploadProgress';
    console.log(fname);
    if (uploadcode == undefined) {
        uploadcode = latestVideoUploadCode;
    }
    if (uploadType == 'video' || uploadType == 'image') {
        var fname = localFilePath.split('/');
        fname = fname[(fname.length - 1)];
        if (uploadType == 'video') {
            videoUploadInProgress = true;
        } else if (uploadType == 'image') {
            thumbnailUploadInProgress = true;
        }
        upVidReq = stat_agent
            .post(simpleEndpoint)
            .set('Host', uploadEndpointUrl.split("/")[2])
            .set('Referer', uploadEndpointUrl)
            .field('csrfmiddlewaretoken', csrfmwtoken)
            .field('upload_code', uploadcode)
            .field('upload_type', uploadType)
            .field('name', 'file')
            .field('filename', fname)
            .accept('application/json, text/javascript, */*; q=0.01')
            .attach('file', `${localFilePath}`)
            .on('progress', function (e) {
                event_generation.raiseHttpClientProgress(evType, getProgressPercent(e.loaded, e.total), null, null, uploadType);
            });
        uploadVideoRequest = upVidReq;
        upVidReq.withCredentials().then((result) => {
            if (uploadType == 'video') {
                videoUploadInProgress = false;
            } else if (uploadType == 'image') {
                thumbnailUploadInProgress = false;
            }
            staticVideoUploadResult = result;
            console.log(result);
            upVidReqResponseBody = upVidReq.response.body;
            if (result.status == 200) {
                if (metapackage == undefined) {
                    metapackage = {
                        jsonMeta: {
                            upload_title: localFilePath
                        }
                    }
                }
                event_generation.createNewUiEvent(`uploaded ${uploadType} for video :${metapackage.jsonMeta.upload_title}`);
                event_generation.raiseAnyEvent(`uploadProgress`, null, null, true, null, null, null, uploadType);
            }
        }).catch((err) => {
            if (uploadType == 'video') {
                videoUploadInProgress = false;
            } else if (uploadType == 'image') {
                thumbnailUploadInProgress = false;
            }
            console.log(err);
        });
    } else if (uploadType == 'meta') {
        var metastring = getJsonMetaData(
            metapackage.jsonMeta.csrfmiddlewaretoken,
            metapackage.jsonMeta.upload_title,
            escape(metapackage.jsonMeta.upload_description),
            metapackage.jsonMeta.upload_code,
            null,
            null,
            metapackage.jsonMeta.sensitivity,
            false,
            false,
            true);
        upVidReq = stat_agent
            .post(getEndpointForStep(simpleEndpoint, uploadType))
            .set('Host', uploadEndpointUrl.split("/")[2])
            .set('Referer', uploadEndpointUrl)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .accept('*/*')
            .send(metastring)
            .withCredentials()
            .buffer(true).then((res) => {
                try {
                    staticVideoUploadResult = res;
                    if (_vb_log) {
                        console.log(res);
                        console.log(res.text);
                        console.log(res.status);
                        console.log(res.headers);
                    }
                } catch (err) { console.log(err.message); }
                if (res.status == 200) {
                    event_generation.createNewUiEvent(`uploaded metadata for video :${metapackage.jsonMeta.upload_title}`);
                    uploadVideoData(uploadEndpointUrl, null, null, null, 'meta_finalize', metapackage);
                }
            }).catch((err) => {
                console.log(err);
                console.log(err.message);
                console.log(err.response);
                event_generation.createNewUiEvent(`error ${err.message} sending metadeta`);
            });
    } else if (uploadType == 'meta_finalize') {
        var metastring = getJsonMetaData(
            metapackage.jsonMeta.csrfmiddlewaretoken,
            null,
            null,
            metapackage.jsonMeta.upload_code,
            metapackage.jsonMeta.cid,
            metapackage.jsonMeta.cdid,
            metapackage.jsonMeta.sensitivity,
            metapackage.jsonMeta.publish_now,
            true,
            true);
        var host = uploadEndpointUrl.split("/")[2];
        upVidReq = stat_agent
            .post(getEndpointForStep(simpleEndpoint, uploadType))
            .set('Host', uploadEndpointUrl.split("/")[2])
            .set('Referer', uploadEndpointUrl)
            .set('Origin', 'https://' + uploadEndpointUrl.split("/")[2])
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0')
            .set('X-Requested-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .accept('*/*')
            .send(metastring)
            .withCredentials()
            .buffer(true).then((res) => {
                try {
                    staticVideoUploadResult = res;
                    if (_vb_log) {
                        console.log(res);
                        console.log(res.text);
                        console.log(res.status);
                        console.log(res.headers);
                    }
                } catch (err) { console.log(err.message); }
                if (res.status == 200) {
                    if (_vb_log) {
                        console.log(res);
                    }
                    console.log('https://www.bitchute.com/video/' + uploadcode + '/');
                    getVidReq = stat_agent
                        .get('https://www.bitchute.com/video/' + uploadcode + '/')
                        .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0')
                        .withCredentials()
                        .buffer(true).then((res) => {
                            responseCookie = res.headers['set-cookie'];
                            session_state.saveAllCookiesFromSetCookie(responseCookie);
                            var newCsrfToken = stripEqualsFromResponse(res.request.cookies);
                            event_generation.createNewUiEvent(`uploaded metadata for video :${metapackage.jsonMeta.upload_title}`);
                            uploadVideoData(
                                uploadEndpointUrl,
                                null,
                                newCsrfToken,
                                null,
                                'add_video_details',
                                metapackage,
                                generateCompletedUploadUrl(uploadcode));
                        }).catch((err) => {
                            console.log(getVidReq)
                            console.log(err);
                            console.log(getVidReq);
                        });
                } else {
                    console.log('error occured getting video path');
                    console.log(res);
                }
            }).catch((err) => {
                console.log(err);
                console.log(err.message);
                console.log(err.response);
                event_generation.createNewUiEvent(`error ${err.message} meta_finalizing video upload`);
                event_generation.raiseAnyEvent('postingVideoFinalized', 'video failed to upload, check error logs');
            });
    } else if (uploadType == 'add_video_details') {
        if (csrfmwtoken != undefined) {
            metapackage.jsonMetaVideoDetails.csrfmiddlewaretoken = csrfmwtoken;
        }
        var metastring = getJsonMetaDataForVideoDetail(
            metapackage.jsonMetaVideoDetails.csrfmiddlewaretoken,
            escape(metapackage.jsonMetaVideoDetails.title),
            escape(metapackage.jsonMetaVideoDetails.description),
            metapackage.jsonMetaVideoDetails.hashtags,
            metapackage.jsonMetaVideoDetails.category,
            metapackage.jsonMetaVideoDetails.sensitivity,
            metapackage.jsonMetaVideoDetails.is_discussable,
            true);
        upVidReq = stat_agent
            .post(`https://www.bitchute.com/video/${uploadcode}/save/`)
            .set('Referer', `https://www.bitchute.com/video/${uploadcode}/`)
            //.set('Host', 'www.bitchute.com')
            //.set('Referer', remoteVideoPath)
            //.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            //.set('Origin', 'https://www.bitchute.com')
            //.accept('*/*')
            .send(metastring)
            .withCredentials()
            .buffer(true).then((res) => {
                try {
                    staticVideoUploadResult = res;
                    if (_vb_log) {
                        console.log(res);
                        console.log(res.text);
                        console.log(res.status);
                        console.log(res.headers);
                    }
                } catch (err) { console.log(err.message); }
                if (res.status == 200) {
                    event_generation.createNewUiEvent(`uploaded video details for video :${metapackage.jsonMetaVideoDetails.title}`);
                    event_generation.raiseAnyEvent('postingVideoFinalized',
                        'video posted successfully',
                        {
                            uploadTitle: metapackage.jsonMetaVideoDetails.title,
                            uploadUrl: remoteVideoPath
                        },
                        true);
                    resetUploadValues();
                }
            }).catch((err) => {
                console.log(err);
                console.log(err.message);
                console.log(err.response);
                event_generation.createNewUiEvent(`error ${err.message} finalizing video upload`);
                event_generation.raiseAnyEvent('postingVideoFinalized', 'video failed to upload, check error logs');
            });
    }
}

function generateCompletedUploadUrl(uploadId) {
    if (uploadId == undefined) { return; }
    return (strDomainVidPath + uploadId);
}

function getProgressPercent(bytesSent, byteTotal) {
    if (vblog()) { console.log(`bytes sent:${bytesSent} of bytes total:${byteTotal}`) }
    return ((bytesSent / byteTotal) * 100);
}

function resetUploadValues() {
    videoUploadInProgress = false;
    thumbnailUploadInProgress = false;
    metaUploadInProgress = false;
    latestVideoUploadCode = undefined;
    upVidReq = undefined;
}

function getEndpointForStep(endpointRoot, step) {
    if (step == 'meta') {
        return endpointRoot + '/uploadmeta/';
    } else if (step == 'meta_finalize') {
        return endpointRoot + '/finish_upload/';
    } else if (step == 'video') {
        return endpointRoot + '/upload/';
    } else if (step == 'image') {
        return endpointRoot + '/upload/';
    } else if (step == 'add_video_details') {
        return endpointRoot + '/save/';
    }
}

function getJsonMetaData(csrfmiddlewaretoken, uploadTitle, uploadDescription, uploadCode, cid, cdid, sensitivity, publishNow, finalize, stringify) {
    csrfmiddlewaretoken = stripEqualsFromResponse(csrfmiddlewaretoken);
    uploadTitle = stripEqualsFromResponse(uploadTitle);
    uploadCode = stripEqualsFromResponse(uploadCode);
    cid = stripEqualsFromResponse(cid);
    cdid = stripEqualsFromResponse(cdid);
    sensitivity = stripEqualsFromResponse(sensitivity.toString());
    publishNow = stripEqualsFromResponse(publishNow);
    if (stringify) {
        if (finalize) {
            var stringified = `csrfmiddlewaretoken=${csrfmiddlewaretoken}&`;
            stringified += `upload_code=${uploadCode}&`;
            stringified += `cid=${cid}&`;
            stringified += `cdid=${cdid}&`;
            stringified += `sensitivity=${sensitivity}&`;
            stringified += `publish_now=${publishNow}`;
        } else {
            var stringified = `csrfmiddlewaretoken=${csrfmiddlewaretoken}&`;
            stringified += `upload_title=${uploadTitle}&`;
            stringified += `upload_description=${uploadDescription}&`;
            stringified += `upload_code=${uploadCode}`;
        }
        return stringified;
    } else {
        var metaDataJson = {
            csrfmiddlewaretoken: csrfmiddlewaretoken,
            upload_code: uploadCode,
            cid: cid,
            cdid: cdid,
            sensitivity: sensitivity,
            publish_now: publishNow,
            upload_title: uploadTitle,
            upload_description: uploadDescription
        };
        return metaDataJson
    }
}

function getJsonMetaDataForVideoDetail(csrfmiddlewaretoken, title, description, hashtags, category, sensitivity, is_discussable, stringify) {
    csrfmiddlewaretoken = stripEqualsFromResponse(csrfmiddlewaretoken);
    if (stringify) {
        var stringified = `csrfmiddlewaretoken=${csrfmiddlewaretoken}&`;
        stringified += `title=${title}&`;
        stringified += `description=${description}&`;
        stringified += `hashtags=${hashtags}&`;
        stringified += `category=${category}&`;
        stringified += `sensitivity=${sensitivity}&`;
        stringified += `is_discussable=${is_discussable}`;
        return stringified;
    } else {
        var metaDataJson = {
            csrfmiddlewaretoken: csrfmiddlewaretoken,
            title: title,
            description: description,
            hashtags: hashtags,
            category: category,
            sensitivity: sensitivity,
            is_discussable: is_discussable
        }
    }
    return metaDataJson
}


function stripEqualsFromResponse(stringParam) {
    try {
        if (typeof (stringParam) === 'string') {
            if (stringParam.match('=')) {
                return stringParam.split('=')[1];
            }
            else {
                return stringParam;
            }
        }
    } catch { }
    return stringParam;
}

function getJsonMetaDataString(csrfmiddlewaretoken, uploadTitle, uploadDescription, uploadCode) {
    try {
        return JSON.stringify({
            csrfmiddlewaretoken: csrfmiddlewaretoken,
            upload_title: uploadTitle,
            upload_description: uploadDescription,
            upload_code: uploadCode
        })
    } catch{ }
}




