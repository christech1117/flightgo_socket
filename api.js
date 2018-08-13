// create LINE SDK config from env variables
var axios = require('axios');
const config = {
    channelAccessToken: "IXZ3MZ1GluvFa+5H7RwfnaZbdK4hMGUTDBLO1UjTronMBupOxqgDsGvZQVx4U93byQ8ZqRht9kP8g0DnMA4Omf5Wx9d6EtNAlDDsrRO6ayqzI+myOWdGOBmAhjgK8BafsdTTVhog1pa5CHGHu37FswdB04t89/1O/w1cDnyilFU=",
    channelSecret: "1c69eba5b75e97f88fe58423b1607cf9",
};
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