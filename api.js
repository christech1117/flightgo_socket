// create LINE SDK config from env variables
var axios = require('axios');

const config = require('./lineConfig.js').lineAccoessTokenConfig
// create LINE SDK client
const line = require('@line/bot-sdk');
const client = new line.Client(config);
// const server = "https://flightgo-backend-dev.herokuapp.com"
const server = "https://www.flightgoai-service.com:9002"

module.exports = {}
module.exports.updateBotModeByUserId = function (userId, body, callback) {
    axios.put(server + '/lineusers/userid/' + userId, {
        isBotMode: body.isBotMode
    })
        .then(function (response) {
            callback(response.data)
        })
        .catch(function (error) {
            console.log(error);
        });
}
module.exports.getLineUserProfile = function (userId, callback) {
    console.log("getLineUserProfile")
    client.getProfile(userId).then((profile) => {
        console.log('profile', profile)
        callback(profile)
    });
}

module.exports.createLineUser = function (userId, callback) {
    this.getLineUserProfile(userId, function (profile) {
        console.log("createLineUser", profile)
        axios.post(server + '/lineusers/', {
            userId: userId,
            name: profile.displayName,
            pictureUrl: profile.pictureUrl,
            gender: false,
            email: "",
            phoneNumber: 0,
            favorite: "",
            age: 0,
            providerId: config.channelId,
            chatRoomId: config.channelId + '_' + userId,
            isBotMode: true,
        }).then(function (response) {
            console.log('created user', response.data)
            callback(response.data)
        }).catch(function (error) {
            console.log('create user error ', error)
        })
    });
}
module.exports.getLineUser = function (userId, callback) {
    axios.get(server + '/lineusers/userid/' + userId, {
        params: {}
    })
        .then(function (response) {
            callback(response.data[0])
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
