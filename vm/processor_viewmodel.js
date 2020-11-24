/*
 * The app is not currently using MVVM pattern but it's getting there!
 * Two reasons it's not using databinding:
 * 
 * 1.) the app didn't have a UI at all when I forked it
 * 2.) i've just been building out a basic UI that works
 *      and experimenting with a lot of stuff so that's why
 *      you see UI stuff mixed in with the business logic
 * 3.) I wanted some time to think about which library to
 *  implement
 *
 *  However, once the app is functional i won't be adding
 *  any bells and whistles until it's moved over to MVVM.
 *  I don't want another android app on my hands.... 
 *  we all know how that turned out lol!  Got too deep in
 *  tha game with no data binding and it became a nightmare!
 *  
 *  I'm eyeing vuejs right now as it looks easy to implement quickly
 *  @hexagod
 */

//var shell = require('shell')

writeToLogin = function writeToLoginDiag(msg) {
    loginDiagnosticTextBox.value = msg.toString();
}

document.getElementById('CurrentUserTextBox').addEventListener('loginEvent', (event) => {
    console.log(event.detail.msg);
    curUserTb.value = event.detail.msg;
    console.log(curUserTb);
})

document.addEventListener('newUiEvent', (event) => {
    writeToLogin(event.detail.message);
})

document.addEventListener('newProgressEvent', (event) => { // @TODO this needs to be redesigned
    if (event.detail.sendTo == 'csrfMiddleWareTokenTextBox') {
        csrfMiddleWareTokenTextBox.value = event.detail.data;
    }
})

document.addEventListener('uploadTokenEvent', (event) => {
        postingLocationTextBox.value = event.detail.data;
        writeToLogin(`got video auth path :` + '\n' + `${event.detail.data}`);
})

document.getElementById('MakeADonationButton').addEventListener('click', () => {
    preventLinksFromOpeningInApp(true);
    shell.openExternal("https://www.bitchute.com/help-us-grow/");
})

//shell is missing so this doesn't work

//var toggleInAppBrowserOverride = function (event) { 
//    event.preventDefault();
//    shell.openExternal(this.href);
//}

//$(document).ready(() => {
//    var preventLinksFromOpeningInApp = function (openExternal) {
//        try {
//            if (openExternal) {
//                $(document).on('click', 'a[href^="http"]', toggleInAppBrowserOverride);
//            } else {
//                $(document).onclick -= toggleInAppBrowserOverride;
//            }
//            console.log(`toggled links opening in app to${openExternal}`)
//        } catch{ }
//    }
//})
