module.exports = {}
var debug = false

module.exports.enableDebug = function (isDebug) {
    debug = isDebug
}

module.exports.log = function (message, data) {
    if (debug) {
        console.log(message, data)
    }
}
