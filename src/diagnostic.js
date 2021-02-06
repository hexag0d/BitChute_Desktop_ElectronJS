
module.exports = {
    writeToDebug,
    writeToDiagnosticText
}

function writeToDebug(text) {
    global.debugStatusTextBox.value += (text + '\n')
    debugStatusTextBox.scrollTo(0, debugStatusTextBox.scrollHeight);
}

function writeToDiagnosticText(text) { global.diagnosticTextBox.value += (text + '\n') }
