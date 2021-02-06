

module.exports = {
    createNewUiEvent,
    raiseNewProgressEvent,
    raiseAnyEvent,
    raiseHttpClientProgress,
    raiseNewVideoProcessingEvent
}

/**
 * Sends generic Ui event to "newUiEvent" listeners
 * 
 * @param {string} msg the message data string
 * @param {boolean} shouldAlertUser should the event trigger an alert prompt
 * 
 */
function createNewUiEvent(msg, shouldAlertUser) {
    var uiEvent = new CustomEvent(
        "newUiEvent",
        {
            detail: {
                shouldAlertUser: shouldAlertUser,
                message: msg
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(uiEvent);
    return uiEvent;
}

/**
 * 
 * @param {any} data most likely an integer value
 * @param {string} setting height|width|videoBitRate|audioBitRate ||h&w in px ||vbr&abr in kbps
 * @param {boolean} userInitiated did user initiate the event?
 */
function raiseEncoderSettingChanged(data, setting, userInitiated) {
    var encoderSettingChangedEvent = new CustomEvent(
        "newProgressEvent",
        {
            detail: {
                data: data,
                setting: setting,
                userInitiated: userInitiated
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(encoderSettingChangedEvent);
    return encoderSettingChangedEvent;
}


function raiseNewVideoProcessingEvent(eventType, message, data, error, success, path, started) {
    var procEvent = new CustomEvent(
        "videoProcessingEvent",
        {
            detail: {
                data: data,
                message: message,
                eventType: eventType,
                error: error,
                success: success,
                path: path,
                started: started
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(procEvent);
    return procEvent;
}

/**
 * 
 * @param {any} data
 * @param {any} sendTo can be an object or an id/class string
 * @param {string} eventType 
 * @param {boolean} sendToEntireClass if this is true then the event will be sent to all class members in sendTo string
 */
function raiseNewProgressEvent(data, sendTo, eventType) {
    var progEvent = new CustomEvent(
        "newProgressEvent",
        {
            detail: {
                data: data,
                sendTo: sendTo,
                eventType: eventType
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(progEvent);
    return progEvent;
}


/**
 * 
 * @param {string} typeOfEvent 'loginEvent'|'settingChange'|'uploadProgressEvent'|'videoProcessingEvent'  
 *                              the type of event to raise
 * @param {string} message a short message to send 
 * @param {any} data any object to send along with the event
 * @param {object} sender the object sending event
 */
function raiseAnyEvent(typeOfEvent, message, data, success, failure, sender, shouldAlertUser, internalType) {
    var anyEvent = new CustomEvent(
        typeOfEvent,
        {
            detail: {
                data: data,
                shouldAlertUser: shouldAlertUser,
                message: message,
                sender: sender,
                success: success,
                failure: failure,
                type: internalType
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(anyEvent);
    return anyEvent;
}

function raiseHttpClientProgress(typeOfEvent, percent, bytesSent, byteTotal, type, message) {
    var progEvent = new CustomEvent(
        typeOfEvent, {
            detail: {
                percent: percent,
                bytesSent: bytesSent,
                byteTotal: byteTotal,
                type: type,
                message: message
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(progEvent);
    return progEvent;
}