// Setup basic express server
'use strict';
const line = require('@line/bot-sdk');
const config = require('./lineConfig.js').lineAccoessTokenConfig
// create LINE SDK client
const client = new line.Client(config);

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3001;
var request = require('request');
var axios = require('axios');

var logging = require('./logging.js')
var api = require('./api.js')

server.listen(3001);
server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// enable debug log
logging.enableDebug(false)

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// add line bot sdk
var providerTokensManager = {
  "1589453831": "9BCweAdC1k5sE+h6cOsEEFlqt5AnCyHbmMkjh5Tx3DvGYMCN6XS+pG2E+1o4i/3Z0EbsbGzIOcmQH7o+UguZr42KsEqwCP0kNb1C0A+jPCRraX8Iv5po87utrmgv5KqdA9kzjn1fSyTDkDzlmQk4hQdB04t89/1O/w1cDnyilFU=",
  "1580838292": "O3kDD5t80yC4I8bCWHUsp0DRRm2ZVl/Y5n2mBKczD4bIxbedCF8CA2B6fSNu0/12jO5k0wbp8etkBa6HVwb6T2a5jCQOOMKovAqq7dbJ0hTUoxfez+u5scFr5xWrH2hjxmu9ZcjKmrK7x9alXFSiTgdB04t89/1O/w1cDnyilFU=",
  "1592656329": "dkpCfOzBlR0Y30KQgtq8hPr06jhr6GV9Ijjvypvzauc/ko/g7YIb49NfE2iLI3dOC3guoASI02XjozS4ZQQK0xE+FDr1Cxy7zhpaQgcp+WcelhfeMfnj6mO6WiqXQ4ZB/OPqBLnc8OzM0mkUKPOpcgdB04t89/1O/w1cDnyilFU=",

  "1597108460": "IXZ3MZ1GluvFa+5H7RwfnaZbdK4hMGUTDBLO1UjTronMBupOxqgDsGvZQVx4U93byQ8ZqRht9kP8g0DnMA4Omf5Wx9d6EtNAlDDsrRO6ayqzI+myOWdGOBmAhjgK8BafsdTTVhog1pa5CHGHu37FswdB04t89/1O/w1cDnyilFU="
}
// Define event
var events = {
  "newMessage": "new message",
  "typing": "typing",
  "stopTyping": "stop typing",
  "disconnect": "disconnect",
  "connection": "connection",
  "userLeft": "user left",
  "userJoined": "user joined",
  "customerServiceJoined": "customer service joined",
  "customerServiceLeft": "customer service left",
  "pickUp": "pick up",
  "resumeBotMode": "resume bot mode"
}

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

var usersManager = {};
var chatRoomManager = {}
var socketClient = require('socket.io-client')('http://localhost:3001');

// event handler
function handleEvent(event) {
  logging.log('event', event)

  // listener
  socketClient.on(events.newMessage, function (data) {
    console.log('[socketClient] on newMessage...', data);
    const channelId = data.providerId // line provider's ID
    const token = providerTokensManager[channelId]
    const userId = data.userId
    const msg = data.message;
    const csName = data.customerServiceName
    api.sendPushMessage(token, userId, msg, csName)
  });

  socketClient.on(events.pickUp, function (data) {
    console.log('[socketClient] on pickUp...', data);
  });

  socketClient.on(events.disconnect, function () {
    console.log('[socketClient]  [%s]on disconnect...', socketClient.id);
  });

  socketClient.on(events.connection, function () {
    console.log(' [socketClient]  on connection...');
  });

  socketClient.on(events.userLeft, function () {
    console.log('[socketClient] [%s] on userLeft...', socketClient.id);
  });

  socketClient.on(events.userJoined, function (user) {
    console.log('[socketClient] [%s] on userJoined...', socketClient.id);
    console.log('[socketClient] on userJoined...', user);

    // add this user new chat room id to chatRoomManager
    chatRoomManager[user.userId] = {
      userId: user.userId,
      customerServiceId :user.customerServiceId,
      chatRoomId: user.chatRoomId,
    }
    
    //user join a new room id
    socketClient.emit(events.userJoined, user);
  });

  socketClient.on(events.pickUp, function () {
    console.log('[socketClient] on pickUp...');
  });

  socketClient.on(events.disconnect, function () {
    console.log('[socketClient] on disconnect...');
  });

  api.getLineUser(event.source.userId, function (user) {
    console.log('user data', user)
    usersManager[user.userId] = user

    // console.log('usersManager', usersManager)
    if (event.type !== 'message' || event.message.type !== 'text') {
      // ignore non-text-messageuser event
      return Promise.resolve(null);
    }

    //userId: 'U7d9b155b96a70afe8607c227b9768677, jackal
    //userId: 'Ucbd48498cf2763c248f367837b5d6d9a , yi ching
    if (usersManager[user.userId].isBotMode) {
      console.log('BOT模式 message:', event.message.text);
      switch (event.message.text) {
        case "客服":
        case "請求客服":
          user.type = "user"
          socketClient.emit(events.userJoined, user);
          return client.replyMessage(event.replyToken, { type: 'text', text: "轉接客服中.." });
        default:
          // ECHO
          return client.replyMessage(event.replyToken, { type: 'text', text: event.message.text });
      }
    } else {
      console.log('客服模式 message:', event.message.text);
      switch (event.message.text) {
        case "斷線":
        case "離開":
        case "結束":
        case "結束客服":
          // disconnect this user
          socketClient.emit(events.userLeft, user);
          break;
        default:
          // console.log('userManager [%s]', user.userId)
          console.log('chatRoomManager:', chatRoomManager[user.userId])
        
          //SEND MESSAGE TO CUSTOMER SERVICE
          socketClient.emit(events.newMessage,
            {
              type: "user",
              providerId: user.providerId,
              userId: user.userId,
              customerServiceId: chatRoomManager[user.userId],
              chatRoomId: chatRoomManager[user.userId].chatRoomId,
              name: user.name,
              message: event.message.text
            });
      }
    }
  });
}

//=========
// SERVER SIDE
//=========
io.sockets.on('connection', function (socket) {
  socket.on(events.userJoined, function (data) {
    console.log('*** [%s]User joining [%s] room', socket.id, data.chatRoomId);
    socket.join(data.chatRoomId);
    api.updateBotModeByUserId(data.userId, { isBotMode: false }, function (res) { })
  });

  socket.on(events.userLeft, function (data) {
    console.log('*** [%s]User leaving [%s] room', socket.id, data.chatRoomId);

    data.message = "您已離開客服模式，若需要客服，請輸入[客服]"
    io.in(data.chatRoomId).emit(events.newMessage, data);

    socket.leave(data.chatRoomId);
    api.updateBotModeByUserId(data.userId, { isBotMode: true }, function (res) { })

  });

  socket.on(events.customerServiceJoined, function (data) {
    console.log('*** [%s] CS joining [%s] room', socket.id, data.chatRoomId);
    console.log('*** CS joining ', data);
    socket.join(data.chatRoomId); //3 ids

    //socket.to(data.chatRoomId).emit('test', "let's play a game");
    //socket.to(getOldRoomId(data.chatRoomId)).emit('test', "let's play a game2222");
    //socket.broadcast.to(getOldRoomId(data.chatRoomId)).emit('test', {"A":1});
  });

  socket.on(events.customerServiceLeft, function (data) {
    console.log('*** [%s] CS leaving [%s] room', socket.id, data.chatRoomId);
    socket.leave(data.chatRoomId);
  });

  //FORMAT
  // {
  // type: "customerservice",
  // providerId: "1597108460",
  // userId: "U7d9b155b96a70afe8607c227b9768677",
  // customerServiceId: "5b4e17e4546347baaf930d8c",
  // customerServiceName: "曾月青",
  // chatRoomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
  // picture: "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon",
  // message: message
  // }
  socket.on(events.newMessage, function (data) {
    console.log('sending message', data.chatRoomId);
    if (data.type == "user") {
      //io.to(data.chatRoomId).emit(events.newMessage, data);
      socket.broadcast.to(data.chatRoomId).emit(events.newMessage, data);
    } else if (data.type == "customerservice") {
      // io.to(data.chatRoomId).emit(events.newMessage, data);
      socket.broadcast.to(data.chatRoomId).emit(events.newMessage, data);
      // io.in(data.chatRoomId).emit(events.newMessage, data);
    }
    //save db

  });

  socket.on(events.pickUp, function (data) {
    // sending to all clients in 'data.room' room(channel), include sender
    console.log(events.pickUp);
    // console.log('PICK UP' ,data)
    data.message = "客服已連線"
    io.in(data.chatRoomId).emit(events.newMessage, data);

    // create new roomId 3 ids
    const newRoomId = data.chatRoomId + "_" + data.customerServiceId
    data = {
      providerId: data.providerId,
      userId: data.userId,
      customerServiceId: data.customerServiceId,
      chatRoomId: newRoomId
    }

    //TODO check is new chat room exist

    //TODO if not exist, create new, otherwise don't create again
    createNewChatRoom(data)
  });
});

var createNewChatRoom = function (data) {
  var request = require("request");
  var options = {
    method: 'POST',
    url: 'https://flightgo-backend-dev.herokuapp.com/chatrooms',
    headers:
    {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    },
    body: { providerId: data.providerId, userId: data.userId, customerServiceId: data.customerServiceId, roomId: data.chatRoomId },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    // notify user to jonin new chat room (3 ID)
    io.to(getOldRoomId(data.chatRoomId)).emit(events.userJoined, {
      type: "user",
      providerId: data.providerId,
      userId: data.userId,
      customerServiceId: data.customerServiceId,
      chatRoomId: data.chatRoomId,
      name: "",
      picture: "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon"
    });
  });
}

var getOldRoomId = function (newRoomId) {
  const sp = newRoomId.split("_");
  if (sp.length != 3) {
    return "error"
  }
  const oldRoomId = sp[0] + "_" + sp[1]
  console.log('oldRoomId', oldRoomId)
  return oldRoomId
}

const getProfile = function (userId) {
  client.getProfile(userId).then((profile) => {
    console.log('profile', profile)
  });
}