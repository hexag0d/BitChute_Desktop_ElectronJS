window.$ = window.jQuery = require('jquery');

const lng_support = require('./languagesupport.js')
const app_setting = require('./settings.js')

try {
    lng_support.setLocalStrings(app_setting.appLanguageSetting); // set the strings to their localized form @TODO not all strings set
} catch (e) { console.log(e) }