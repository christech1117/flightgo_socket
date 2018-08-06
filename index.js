// Setup basic express server
'use strict';

const line = require('@line/bot-sdk');
// create LINE SDK config from env variables
const config = {
  channelAccessToken: "IXZ3MZ1GluvFa+5H7RwfnaZbdK4hMGUTDBLO1UjTronMBupOxqgDsGvZQVx4U93byQ8ZqRht9kP8g0DnMA4Omf5Wx9d6EtNAlDDsrRO6ayqzI+myOWdGOBmAhjgK8BafsdTTVhog1pa5CHGHu37FswdB04t89/1O/w1cDnyilFU=",
  channelSecret: "1c69eba5b75e97f88fe58423b1607cf9",
};

// create LINE SDK client
const client = new line.Client(config);

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3001;
var request = require('request');
server.listen(3001);

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

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
  "pickUp": "pick up"
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
var socketClient = require('socket.io-client')('http://localhost:3001');
var isBotMode = true;

// event handler
function handleEvent(event) {
  // console.log("HANDLE EVENT", event)
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  socketClient.on(events.newMessage, function (data) {
    console.log('[%s]on newMessage...', socketClient.id);
    const channelId = data.providerId // line provider's ID
    let token = providerTokensManager[channelId]
    let userId = data.userId
    let msg = data.message;
    let csName = data.customerServiceName
    sendPushMessage(token, userId, msg, csName)
  });
  
  socketClient.on(events.disconnect, function () {
    console.log('[%s]on disconnect...', socketClient.id);
  });

  socketClient.on(events.connection, function () {
    console.log('[%s]on connection...', socketClient.id);
  });

  socketClient.on(events.userLeft, function () {
    console.log('[%s]on userLeft...', socketClient.id);
  });

  socketClient.on(events.userJoined, function (data) {
    console.log('[%s]on userJoined...', socketClient.id);

    //user join a new room id
    socketClient.emit(events.userJoined, data);
  });

  socketClient.on(events.pickUp, function () {
    console.log('[%s]on pickUp...', socketClient.id);
  });
  //userId: 'U7d9b155b96a70afe8607c227b9768677, jackal
  //userId: 'Ucbd48498cf2763c248f367837b5d6d9a , yi ching
  if (isBotMode) {
    console.log('BOT模式', event.message.text);
    if (event.message.text == "客服") {
      console.log(event.message.text);
      //=========
      // CLIENT SIDE
      //=========
      socketClient.emit(events.userJoined,
        {
          type: "user",
          providerId: "1597108460",
          userId: "U7d9b155b96a70afe8607c227b9768677",
          customerServiceId: "Unknow",
          roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677"
        });
      isBotMode = false
      return client.replyMessage(event.replyToken, { type: 'text', text: "轉接客服中.." });
    } else {
      return client.replyMessage(event.replyToken, { type: 'text', text: event.message.text });
    }
  } else {
    console.log('客服模式', event.message.text);
    switch (event.message.text) {
      case "斷線":
        // disconnect this user
        isBotMode = true
        break;
      default:
        socketClient.emit(events.newMessage,
          {
            type: "user",
            providerId: "1597108460",
            userId: "U7d9b155b96a70afe8607c227b9768677",
            customerServiceId: "5b4e17e4546347baaf930d8c",
            roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
            name: "U7d9b155b96a70afe8607c227b9768677",
            message: event.message.text
          });
    }
  }
}

//=========
// SERVER SIDE
//=========
io.sockets.on('connection', function (socket) {
  // {
  //   type: "user",
  //   providerId: "1597108460",
  //   userId: "U7d9b155b96a70afe8607c227b9768677",
  //   userNmae:""
  //   customerServiceId: "Unknow",
  //   roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677"
  // }
  socket.on(events.userJoined, function (data) {
    console.log('*** [%s]User joining [%s] room', socket.id, data.roomId);
    socket.join(data.roomId);
  });

  socket.on(events.customerServiceJoined, function (data) {
    console.log('*** [%s] CS joining [%s] room', socket.id, data.roomId);
    socket.join(data.roomId); //3 ids
  });

  socket.on(events.customerServiceLeft, function (data) {
    console.log('*** [%s] CS leaving [%s] room', socket.id, data.roomId);
    socket.leave(data.roomId);
  });

  //FORMAT
  // {
  // type: "customerservice",
  // providerId: "1597108460",
  // userId: "U7d9b155b96a70afe8607c227b9768677",
  // customerServiceId: "5b4e17e4546347baaf930d8c",
  // customerServiceName: "曾月青",
  // roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
  // picture: "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon",
  // message: message
  // }
  socket.on(events.newMessage, function (data) {
    console.log('sending message', data.roomId);
    if (data.type == "user") {
      //io.to(data.roomId).emit(events.newMessage, data);
      socket.broadcast.to(data.roomId).emit(events.newMessage, data);
    } else if (data.type == "customerservice") {
      //io.to(data.roomId).emit(events.newMessage, data);
      //socket.broadcast.to(data.roomId).emit(events.newMessage, data);
      io.in(data.roomId).emit(events.newMessage, data);
    }
    //save db
  });

  socket.on(events.pickUp, function (data) {
    // sending to all clients in 'data.room' room(channel), include sender
    console.log(events.pickUp);
    data.message = "客服已連線"
    io.in(data.roomId).emit(events.newMessage, data);

    
    // create new roomId 3 ids
    const newRoomId = data.roomId + "_" + data.customerServiceId
    data = {
      providerId: data.providerId,
      userId: data.userId,
      customerServiceId: data.customerServiceId,
      roomId: newRoomId
    }
    socket.emit(events.customerServiceJoined, data);
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
    body: { providerId: data.providerId, userId: data.userId, customerServiceId: data.customerServiceId, roomId: data.roomId },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    io.to(getOldRoomId(data.roomId)).emit(events.userJoined, {
      type: "user",
      providerId: data.providerId,
      userId: data.userId,
      customerServiceId: data.customerServiceId,
      roomId: data.roomId,
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


const sendPushMessage = function (token, userId, msg, customerServiceName) {
  const client = new line.Client({
    channelAccessToken: token
  });
  const message = {
    type: 'text',
    text: customerServiceName + ":\n" + msg
  }

  client.pushMessage(userId, message)
    .then(() => {
      console.log('sent message success')
    })
    .catch((err) => {
      // error handling
      console.log('sent message failed', err)
    });
}