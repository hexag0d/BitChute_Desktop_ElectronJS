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
 * It needs to get split up between login and upload
 * methods since they really shouldn't share a code file
 * 
 * The UI needs to get separated from the business logic
 * 
 * There's a bunch of static vars that need to get turned
 * into a class but we're not in C# anymore so I'll have to
 * lookup how to do that
 * 
 * part of the reason I'm using them atm is to inspect 
 * the variables easily in console while I work this process
 * out
 * 
 * Right now I'm just trying to get this working and then
 * I'll start breaking this file up aswell as segregating the ui
 * 
 * */

//framework
//const axios = require('axios').default; //@TODO remove axios

const electron = require('electron');
const net = electron.remote.net; 
const FormData = require('form-data');
const querystring = require('querystring');
const https = require('https');
const superagent = require('superagent')

var diag = require('./diagnostic.js')
var endpoints = require('./endpoints.js')
const fs = require('fs')

uploadVideoButton.addEventListener('click', () => {
    if (global.processedVideoTextBox.value == '' || !global.processedVideoTextBox.value) {
        alert(global.localNoFileSelected); return;
    }
    uploadVideoData(postingLocationTextBox.value,
        processedVideoTextBox.value,
        csrfMiddleWareTokenTextBox.value,
        latestVideoUploadCode, 'video');
})

uploadThumbnailButton.addEventListener('click', () => {
    if (global.thumbnailSourceTextBox.value == '' || !global.thumbnailSourceTextBox.value) {
        alert(global.localNoFileSelected); return;
    }
    uploadVideoData(
        postingLocationTextBox.value,
        thumbnailSourceTextBox.value,
        csrfMiddleWareTokenTextBox.value,
        latestVideoUploadCode, 'image');
})

document.getElementById('PostVideoFinalButton').addEventListener('click', () => {
    var urlStringParts = postingLocationTextBox.value.split('&');
    uploadVideoData(postingLocationTextBox.value,
        null,
        null,
        null,
        'meta',
        getJsonMetaData(
            csrfMiddleWareTokenTextBox.value,
            document.getElementById('TitleTextInput').value,
            document.getElementById('DescriptionText').value,
            latestVideoUploadCode,
            urlStringParts[urlStringParts.length - 2],
            urlStringParts[urlStringParts.length - 1],
            10, //@TODO add sensitivity
            document.getElementById('PublishNowCheckBox').checked,
            false
        ));

})


getInitialResponseButton.addEventListener('click', () => {
    getInitialResponseWithNet();
})

getUploadTokenButton.addEventListener('click', () => {
    getUploadTokenResponse();
})

loginButton.addEventListener('click', () => {
    passwordTextBox.value;
    userNameTextBox.value;
    csrfMiddleWareTokenTextBox.value;
    makeLoginRequest(userNameTextBox.value, passwordTextBox.value, csrfMiddleWareTokenTextBox.value, '');
})

function createDocument(html) {
    var doc = document.implementation.createHTMLDocument('new doc');
    doc.documentElement.innerHTML = html;
    return doc;
}

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

async function getInitialResponseWithNet() {
    createNewUiEvent('getting initial web response');
    responseCookie = undefined;
    initialDoc = undefined;
    request = undefined;
    stat_agent = superagent.agent();
    request = stat_agent.get('https://www.bitchute.com/').buffer(true).withCredentials()
    .then((res) => {
        console.log(res.headers);
        console.log(res.text);
        console.log(res.status);
        initialDoc = createDocument(res.text);
        const cookie = res.headers['set-cookie'];
        csrfMiddleWareTokenTextBox.value = initialDoc.getElementsByTagName('input').csrfmiddlewaretoken.value;
        if (res.status === 200) {
            createNewUiEvent('got objects from site');
        }
    });
}

getInitialResponseWithNet();

async function makeLoginRequest(username, password, csrfmiddlewaretoken, onetimecode) {
    createNewUiEvent(`making login attempt`);
    initialDocStore = createDocument(requestChunk);
    console.log(csrfmiddlewaretoken);
    responseCookie = '';
    request = undefined;
    request = stat_agent.post('https://www.bitchute.com/accounts/login/')
        .set('Referer', 'https://www.bitchute.com/')
        .set('X-Requested-With', 'XMLHttpRequest').set('Accept', '*/*')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .withCredentials()
        .send(getLoginFormDataString(username, password, csrfmiddlewaretoken, onetimecode))
        .buffer(true).then((res) => {
            console.log(res.text);
            console.log(res.status);
            console.log(res.headers);
            if (res.text.match('"errors": "None"')) {
                createNewUiEvent(`logged in as ${username}`);
            }
        }).catch((err) => {
            console.log(err);
            console.log(err.message);
            console.log(err.response);
            createNewUiEvent(`error ${err.message} making login attempt`);
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


async function getUploadTokenResponse() {
    createNewUiEvent('getting upload token response');
    upTokenReq = stat_agent.get('https://www.bitchute.com/myupload/');
    uploadTokenRequest = upTokenReq;
    upTokenReq.buffer(true).withCredentials()
        .set('Connection', 'keep-alive').redirects(1)
        .then((res) => {
            uploadTokenResponse = res.headers;
            try {
                console.log(res.headers);
                console.log(upTokenReq.response.headers["location"]);
                console.log(upTokenReq.response.headers);
            } catch{}
            try {
                console.log(res.status);
                console.log(res.text);
            } catch { }
            try {
                console.log(res.headers);
            } catch (err) {
                createNewUiEvent(`error ${err} getting upload token web response`);
            }
            latestVideoUploadCsrfToken = createDocument(res.text)
                .getElementById('fileupload').getAttribute('data-form-data').split('\"')[3];
            createNewUiEvent(`got upload token response for ${uploadLocation}`);
            if (upTokenReq.url != null && upTokenReq != undefined) {
                createNewProgressEvent(upTokenReq.url, 'vidToken');
                getUploadCodesFromUrlString(upTokenReq.url);
            }
            if (latestVideoUploadCsrfToken != '') {
                createNewProgressEvent(latestVideoUploadCsrfToken, 'csrfMiddleWareTokenTextBox');
            }
        });
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

function uploadVideoData(uploadEndpointUrl, localFilePath, csrfmwtoken, uploadcode, uploadType, metapackage) {
    var simpleEndpoint = uploadEndpointUrl.split('?upload')[0];
    if (metapackage != undefined) {
        simpleEndpoint = simpleEndpoint.split('/upload/')[0];
    }
    console.log(fname);
    if (uploadType == 'video' || uploadType == 'image') {
        var fname = localFilePath.split('/');
        fname = fname[(fname.length - 1)];
        upVidReq = stat_agent
            .post(simpleEndpoint)
            .set('Host', uploadEndpointUrl.split("/")[2])
            .set('Referer', uploadEndpointUrl)
            .set('Content-Type', 'multipart/form-data; boundary=---------------------------18467633426500')
            .field('csrfmiddlewaretoken', csrfmwtoken)
            .field('upload_code', uploadcode)
            .field('upload_type', uploadType)
            .field('name', 'file')
            .field('filename', fname)
            .accept('application/json, text/javascript, */*; q=0.01')
            .attach('file', `${localFilePath}`);
        uploadVideoRequest = upVidReq;
        upVidReq.withCredentials().then((result) => {
            staticVideoUploadResult = result;
            console.log(result);
            upVidReqResponseBody = upVidReq.response.body;
        }).catch((err, res) => {
            console.log(res);
            console.log(err);
        });
    } else if (uploadType == 'meta') {
        var metastring = getJsonMetaData(
            metapackage.csrfmiddlewaretoken,
            metapackage.upload_title,
            metapackage.upload_description,
            metapackage.upload_code,
            null,
            null,
            10,
            false,
            false,
            true);
        upVidReq = stat_agent
            .post(getEndpointForStep(simpleEndpoint,uploadType))
            .set('Host', uploadEndpointUrl.split("/")[2])
            .set('Referer', uploadEndpointUrl)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .accept('*/*')
            .send(metastring)
            .withCredentials()
            .buffer(true).then((res) => {
                try {
                    staticVideoUploadResult = res;
                    console.log(res);
                    console.log(res.text);
                    console.log(res.status);
                    console.log(res.headers);
                } catch (err) { console.log(err.message); }
                if (res.status == 200) {
                    createNewUiEvent(`uploaded metadata for video :${metapackage.upload_title}`);
                    uploadVideoData(uploadEndpointUrl, null, null, null, 'meta_finalize', metapackage);
                }
            }).catch((err) => {
                console.log(err);
                console.log(err.message);
                console.log(err.response);
                createNewUiEvent(`error ${err.message} sending metadeta`);
            });

    } else if (uploadType == 'meta_finalize') {
        var metastring = getJsonMetaData(
            metapackage.csrfmiddlewaretoken,
            null,
            null,
            metapackage.upload_code,
            metapackage.cid,
            metapackage.cdid,
            10, //@TODO add this
            metapackage.publish_now,
            true,
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
                    console.log(res);
                    console.log(res.text);
                    console.log(res.status);
                    console.log(res.headers);
                } catch (err) { console.log(err.message); }
                try {
                    console.log(res.response.body);
                } catch {

                }
                if (res.status == 200) {
                    createNewUiEvent(`uploaded metadata for video :${metapackage.upload_title}`);
                }
            }).catch((err) => {
                console.log(err);
                console.log(err.message);
                console.log(err.response);
                createNewUiEvent(`error ${err.message} finalizing video upload`);
            });
    }
    try {
        createNewUiEvent(upVidReqResponseBody.toString());
    } catch (err) {
        createNewUiEvent(err.message);
    }
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
    if (finalize) {
        if (stringify) {
            var stringified = `csrfmiddlewaretoken=${csrfmiddlewaretoken}&`;
            stringified += `upload_code=${uploadCode}&`;
            stringified += `cid=${cid}&`;
            stringified += `cdid=${cdid}&`;
            stringified += `sensitivity=${sensitivity}&`;
            stringified += `publish_now=${publishNow}`;
            return stringified;
        } else {
            var metaDataJson = {
                csrfmiddlewaretoken: csrfmiddlewaretoken,
                upload_code: uploadCode,
                cid: cid,
                cdid: cdid,
                sensitivity: sensitivity,
                publish_now: publishNow
            }
        }
    } else {
        if (stringify) {
            var stringified = `csrfmiddlewaretoken=${csrfmiddlewaretoken}&`;
            stringified += `upload_title=${uploadTitle}&`;
            stringified += `upload_description=${uploadDescription}&`;
            stringified += `upload_code=${uploadCode}`;
            return stringified;
        } else {
            var metaDataJson = {
                csrfmiddlewaretoken: csrfmiddlewaretoken,
                upload_title: uploadTitle,
                upload_description: uploadDescription,
                upload_code: uploadCode
            }
        }
    }
    return metaDataJson;
}

function stripEqualsFromResponse(stringParam) {
    try {
        if (stringParam.match('=')) {
            return stringParam.split('=')[1];
        }
        else {
            return stringParam;
        }
    } catch { }
    return '';
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

document.addEventListener('newProgressEvent', (event) => {
    if (event.detail.sendTo == 'vidToken') {
        //if (event.detail.data.match('?upload_code=')) {

        //}

    }
});

let staticResponse = undefined;

function endpointIsBitChute(url) {
    try {
        if ((url.toString().split('.')[1] === 'bitchute') && url.toString().split('.')[2].startsWith('com/')) {
            return true;
        }
    }
    catch (err) { diag.writeToDiagnosticText(err.message); return false; }    
    return false;
}

function getCookieString() {
    var cookieString = '';

    if (cfduidCookie != '') {

    }
    if (csrfTokenCookie != '') {

    }
    if (sessionIdCookie != '') {

    }
    if (csrfMiddleWareToken != '') {

    }
    return cookieString;
}

csrfMiddleWareToken = '';
cfduidCookie = '';
csrfTokenCookie = '';
sessionIdCookie = '';

/**
 * 
 * @param {any} localDataPath
 * @param {any} type
 * @param {any} config
 * @param {any} url
 */

async function postData(localDataPath, type, config, url) { 
    var formData = new FormData();
    if (type === 'video' || 'thumbnail') {
        formData.append('file', fs.createReadStream(localDataPath));
    } else { formData.append('file', localDataPath) }
    var rescon = [];
}

function createNewUiEvent(msg) {
    var uiEvent = new CustomEvent(
        "newUiEvent",
        {
            detail: {
                message: msg
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(uiEvent);
    return uiEvent;
}

function createNewProgressEvent(data, sendTo) {
    var progEvent = new CustomEvent(
        "newProgressEvent",
        {
            detail: {
                data: data,
                sendTo: sendTo
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(progEvent);
    return progEvent;
}


