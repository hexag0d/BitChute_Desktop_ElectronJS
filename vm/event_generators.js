

module.exports = {
    createNewUiEvent,
    createNewProgressEvent,
    raiseAnyEvent
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
 * @param {any} data
 * @param {any} sendTo can be an object or an id/class string
 * @param {string} eventType 
 * @param {boolean} sendToEntireClass if this is true then the event will be sent to all class members in sendTo string
 */
function createNewProgressEvent(data, sendTo, eventType) {
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
 * @param {string} msg a short message to send 
 * @param {any} data any object to send along with the event
 * @param {object} sender the object sending event
 */
function raiseAnyEvent(typeOfEvent, msg, data, sender, shouldAlertUser) {
    var anyEvent = new CustomEvent(
        typeOfEvent,
        {
            detail: {
                data: data,
                shouldAlertUser: shouldAlertUser,
                message: msg,
                sender: sender
            },
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(anyEvent);
    return anyEvent;
}