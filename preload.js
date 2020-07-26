const { readFileSync } = require('fs')

// the host page will have access to `window.readConfig`,
// but not direct access to `readFileSync`
window.readConfig = function () {
    const data = readFileSync('./config.json')
    return data
}