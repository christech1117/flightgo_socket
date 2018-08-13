// create LINE SDK config from env variables
var axios = require('axios');

const config = require('./lineConfig.js').lineAccoessTokenConfig
// create LINE SDK client
const line = require('@line/bot-sdk');
const client = new line.Client(config);
module.exports = {}
module.exports.updateBotModeByUserId = function (userId, body, callback) {
    axios.put('https://flightgo-backend-dev.herokuapp.com/lineusers/userid/' + userId, {
        isBotMode: body.isBotMode
    })
        .then(function (response) {
            callback(response.data)
        })
        .catch(function (error) {
            console.log(error);
        });
}
module.exports.sendPushMessage = function (token, userId, msg, customerServiceName) {
    console.log('sendPushMessage token',token)
    console.log('sendPushMessage userId',userId)
    const client = new line.Client({
        channelAccessToken: token
    });
    const message = {
        type: 'text',
        text: customerServiceName + ":\n" + msg
    }

    client.pushMessage(userId, message)
        .then(() => {
            console.log('sent message success', message)
        })
        .catch((err) => {
            // error handling
            console.log('sent message failed', err)
        });
}

module.exports.getLineUser = function (userId, callback) {
    axios.get('https://flightgo-backend-dev.herokuapp.com/lineusers/userid/' + userId, {
        params: {}
    })
        .then(function (response) {
            callback(response.data[0])
        })
        .catch(function (error) {
            console.log(error);
        });
}