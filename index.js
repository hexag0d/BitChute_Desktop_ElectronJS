window.$ = window.jQuery = require('jquery');

const lng_support = require('./languagesupport.js')
const app_setting = require('./settings.js')


lng_support.setLocalStrings(app_setting.getAppLanguageSetting); // set the strings to their localized form @TODO not all strings set
