
module.exports = {
    writeToDebug,
    writeToDiagnosticText
}

function writeToDebug(text) { global.debugStatusTextBox.value += (text + '\n') }

function writeToDiagnosticText(text) { global.diagnosticTextBox.value += (text + '\n') }
