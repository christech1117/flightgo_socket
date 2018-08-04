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
  "addUser": "add user",
  "login": "login",
  "typing": "typing",
  "stopTyping": "stop typing",
  "disconnect": "disconnect",
  "connection": "connection",
  "userLeft": "user left",
  "userJoined": "user joined",
  "customerServiceJoined": "customer service joined",
  "customerServiceLeft": "customer service left",
  "pickUp": "pick up",
  "csConnected": "cs connected"
}

var isBotMode = true;

// Chatroom for TEST
var chatRoomId = "1597108460_U7d9b155b96a70afe8607c227b9768677"
var serviceChatRoomId = "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c"
var numUsers = 0;

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
var socketClient = null
// event handler
function handleEvent(event) {
  // console.log("HANDLE EVENT", event)
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  //userId: 'U7d9b155b96a70afe8607c227b9768677, jackal
  //userId: 'Ucbd48498cf2763c248f367837b5d6d9a , yi ching

  socketClient = require('socket.io-client')('http://localhost:3001');
  if (isBotMode) {
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
      
      socketClient.on(events.newMessage, function (data) {
        console.log('[%s]on newMessage...', socketClient.id);
        //push message
        console.log('push to user')
        const channelId = data.providerId // line provider's ID
        let token = providerTokensManager[channelId]
        let userId = data.userId
        let msg = data.message;
        //console.log('token', token)
        sendPushMessage(token, userId, msg)
      });

      socketClient.on(events.addUser, function () {
        console.log('[%s]on addUser...', socketClient.id);
      });

      socketClient.on(events.login, function () {
        console.log('[%s]on login...', socketClient.id);
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
      //=========
      socketClient.on('connect', function () {
        console.log('[%s]on connect...', socketClient.id);
      });

      socketClient.on('event', function (data) {
        console.log('[%s]on event...', socketClient.id, data);
      });

      socketClient.on('news', function (data) {
        console.log('[%s]on news...', socketClient.id, data);
        socketClient.emit('event', {
          msg: 'test', ts: new Date()
        });
      });

      socketClient.on('disconnect', function () {
        console.log('[%s]on disconnect....', socketClient.id);
      });

      isBotMode = false
      const echo = { type: 'text', text: "轉接客服中.." };
      // use reply API
      return client.replyMessage(event.replyToken, echo);
    } else {
      // create a echoing text message
      const echo = { type: 'text', text: event.message.text };
      // use reply API
      return client.replyMessage(event.replyToken, echo);
    }
  } else {
    console.log('客服模式', event.message.text);
    console.log('socketClient is null?' , socketClient == null ? socketClient.id : null)
    io.in("1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c").emit(events.message, {
      type: "user",
      providerId: "1597108460",
      userId: "U7d9b155b96a70afe8607c227b9768677",
      customerServiceId: "5b4e17e4546347baaf930d8c",
      roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
      message: event.message.text
    });
    socketClient.io.emit(events.message,
      {
        type: "user",
        providerId: "1597108460",
        userId: "U7d9b155b96a70afe8607c227b9768677",
        customerServiceId: "5b4e17e4546347baaf930d8c",
        roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
        message: event.message.text
      });
    socketClient.emit(events.message,
      {
        type: "user",
        providerId: "1597108460",
        userId: "U7d9b155b96a70afe8607c227b9768677",
        customerServiceId: "5b4e17e4546347baaf930d8c",
        roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
        message: event.message.text
      });
    io.in('1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c').emit(events.message, {
      type: "user",
      providerId: "1597108460",
      userId: "U7d9b155b96a70afe8607c227b9768677",
      customerServiceId: "5b4e17e4546347baaf930d8c",
      roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
      message: event.message.text
    });
    io.in('1597108460_U7d9b155b96a70afe8607c227b9768677').emit(events.message, {
      type: "user",
      providerId: "1597108460",
      userId: "U7d9b155b96a70afe8607c227b9768677",
      customerServiceId: "5b4e17e4546347baaf930d8c",
      roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
      message: 'cool game'
    });
  }
}

//=========
// SERVER SIDE
//=========
io.sockets.on('connection', function (socket) {
  // {
  //   providerId: "1597108460",
  //   userId: "U7d9b155b96a70afe8607c227b9768677",
  //   customerServiceId: "Unknow",
  //   roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677"
  // }
  socket.on(events.userJoined, function (data) {
    console.log('*** [%s]User joining [%s]room',socket.id, data.roomId);
    socket.join(data.roomId);
  });

  // {
  //   type: "customerservice",
  //   providerId: "1597108460",
  //   userId: "U7d9b155b96a70afe8607c227b9768677",
  //   customerServiceId: "5b4e17e4546347baaf930d8c",
  //   roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
  //   name: "曾月青",
  //   picture: "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon"
  // }
  socket.on(events.customerServiceJoined, function (data) {
    console.log('*** [%s] CS joining [%s]room',socket.id, data.roomId);
    socket.join(data.roomId);

    console.log('Invite User joining new room');
    io.in(getOldRoomId(data.roomId)).emit(events.userJoined, data);
  });

  socket.on(events.customerServiceLeft, function (data) {
    console.log('socket id', socket.id);
    console.log('CS leaving room', data.roomId);
    socket.leave(data.roomId);
  });

  socket.on(events.newMessage, function (data) {
    console.log('sending message');
    // sending to sender client, only if they are in 'data.room' room(channel)
    // socket.to(data.room).emit('message', 'enjoy the game');

    if (data.type == "user") {
      // sending to all clients in 'data.room' room(channel), include sender
      io.in(data.roomId).emit(events.newMessage, data.message);
    } else if (data.type == "customerservice") {
      // sending to all clients in 'data.room' room(channel), include sender
      io.in(data.roomId).emit(events.newMessage, data);
    }
    //save db
  });

  socket.on(events.pickUp, function (data) {
    // sending to all clients in 'data.room' room(channel), include sender
    data.message = "客服已連線"
    console.log(events.pickUp, data);
    io.in(data.roomId).emit(events.newMessage, data);

    // data = {
    //   "userId": data.userId,
    //   "providerId": data.providerId,
    //   "customerServiceId": data.customerServiceId,
    //   "roomId": data.roomId,
    // }

    // create new roomId 3 ids
    const newRoomId = data.roomId + "_" + data.customerServiceId
    createNewChatRoom({
      providerId: data.providerId,
      userId: data.userId,
      customerServiceId: data.customerServiceId,
      roomId: newRoomId
    })
  });
});

var createNewChatRoom = function (data) {
  console.log('createChatRoom', data);
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

    //console.log('notify user of userId subscribe this new room id', body);
    //notify user of userId subscribe this new room id
    // io.in(getOldRoomId(data.roomId)).emit(events.csConnected, {
    //   "providerId": data.providerId,
    //   "userId": data.userId,
    //   "customServiceId": data.customServiceId,
    //   "roomId": data.roomId
    // });
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


const sendPushMessage = function (token, userId, msg) {
  const client = new line.Client({
    channelAccessToken: token
  });
  const message = {
    type: 'text',
    text: msg
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


// io.sockets.on('connection', function (socket) {
//   var addedUser = false;

//   socket.on('subscribe', function (data) {
//     console.log('data', data)
//   });

//   socket.on(events.addUser, function (user) {
//     console.log('joining room', user);
//     //  {
//     //   "id": "U33d4b31a307907a59aa13c46c68e2919",
//     //   "name": "王大明",
//     //   "providerId":"1589453831",
//     //   "roomId":"1589453831_U33d4b31a307907a59aa13c46c68e2919",
//     //   "isChatBotMode": True,
//     // }
//     ++numUsers;
//     addedUser = true;
//     socket.emit('login', {
//       numUsers: numUsers,
//       user: user
//     });

//     console.log("socket join:", user.roomId)
//     socket.join(user.roomId);

//     // socket.broadcast.to(user.roomId).emit(events.userJoined, {
//     //   user:user,
//     //   userName: "jackal"
//     // });

//     socket.emit(events.userJoined, {
//       user: user,
//       userName: user.name,
//       roomId: user.roomId,
//       userId: user.id
//     });
//   })

//   socket.on('unsubscribe', function (room) {
//     console.log('leaving room', room);
//     socket.leave(room);
//   })
//   // JSON FOTMAT from customer service
//   // data {
//   //   "type": "customerservice",
//   //   "userId" : line_users.get(user_key).get('id'),
//   //   "userUame": userName,
//   //   "message": message  
//   //   "roomId" : "",
//   //   "providerId" : "",
//   //   "timestamp" :"",
//   // }

//   // JSON FOTMAT from linebot's user
//   //   data = {
//   //     "type": "user",
//   //     "userId" : line_users.get(user_key).get('id'),
//   //     "userName" : line_users.get(user_key).get('name'),
//   //     "message" : event.message.text,
//   //     "roomId" : line_users.get(user_key).get('roomId'),
//   //     "providerId" : line_users.get(user_key).get('providerId'),
//   //     "timestamp: "",
//   // }
//   socket.on(events.newMessage, function (data) {
//     console.log('sending message', data);
//     //data.roomId = "1589453831_U33d4b31a307907a59aa13c46c68e2919_5b4e17e4546347baaf930d8c"

//     const sp = data.roomId.split("_");
//     if (sp.length != 3) {
//       console.log('sp length != 3', sp);
//       return "error"
//     }

//     const channelId = sp[0] // line provider's ID
//     const userId = sp[1]  // line user's ID
//     const customServiceId = sp[2] // 
//     console.log('channelId', channelId)
//     console.log('userId', userId)
//     console.log('customServiceId', customServiceId)

//     if (data.type == "customerservice") {
//       console.log('sent to user')
//       let token = providerTokensManager[channelId]
//       let userId = userId
//       let msg = data.message;
//       console.log('token', token)
//       sendPushMessage(token, userId, msg)
//       socket.broadcast.emit(events.newMessage, {
//         username: data.userName,
//         userId: data.userId,
//         message: data.message,
//         roomId: data.roomId,
//         providerId: data.providerId
//       });
//     } else if (data.type == "user") {
//       console.log('sent to customer service')
//       socket.broadcast.emit(events.newMessage, {
//         username: data.userName,
//         userId: data.userId,
//         message: data.message,
//         roomId: data.roomId,
//         providerId: data.providerId
//       });
//     }
//   });

//   // when the client emits 'typing', we broadcast it to others
//   socket.on(events.typing, () => {
//     console.log('typing');
//     socket.broadcast.emit(events.typing, {
//       username: socket.username
//     });
//   });

//   // when the client emits 'stop typing', we broadcast it to others
//   socket.on(events.stopTyping, () => {
//     console.log('stop typing');
//     socket.broadcast.emit(events.stopTyping, {
//       username: socket.username
//     });
//   });

//   // when the user disconnects.. perform this
//   socket.on(events.disconnect, () => {
//     console.log('disconnect');
//     // echo globally that this client has left
//     // socket.broadcast.emit(events.userLeft, {
//     //   username: socket.username,
//     //   numUsers: numUsers
//     // });

//     if (addedUser) {
//       --numUsers;

//       // echo globally that this client has left
//       socket.emit(events.userLeft, {
//         username: socket.username,
//         numUsers: numUsers
//       });
//     }
//   });
// });

//=====

// io.on('connection', (socket) => {
//   var addedUser = false;
//   // when the client emits 'new message', this listens and executes

//   socket.on('new message', (data) => {
//     console.log('socket.username: ' + socket.username);
//     console.log(data);

//     // we tell the client to execute 'new message'
//     socket.broadcast.emit('new message', {
//       username: socket.username,
//       message: data.message
//     });
//   });

//   socket.on(chatRoomId, (data) => {
//     console.log('chatRoomId: ' + chatRoomId);
//     console.log('chatRoomId: ' + data.chatRoomId);
//     // we tell the client to execute 'new message'
//     socket.broadcast.emit('new message', {
//       username: socket.username,
//       message: data.message
//     });
//   });

//   // when the client emits 'add user', this listens and executes
//   socket.on('add user', (username) => {
//     console.log('add user',username);
//     if (addedUser) return;
//     // we store the username in the socket session for this client
//     socket.username = username;
//     ++numUsers;
//     addedUser = true;
//     socket.emit('login', {
//       numUsers: numUsers
//     });

//     // echo globally (all clients) that a person has connected
//     socket.broadcast.emit('user joined', {
//       username: socket.username,
//       numUsers: numUsers
//     });
//   });

//   // when the client emits 'typing', we broadcast it to others
//   socket.on('typing', () => {
//     console.log('typing');
//     socket.broadcast.emit('typing', {
//       username: socket.username
//     });
//   });

//   // when the client emits 'stop typing', we broadcast it to others
//   socket.on('stop typing', () => {
//     console.log('stop typing');
//     socket.broadcast.emit('stop typing', {
//       username: socket.username
//     });
//   });

//   // when the user disconnects.. perform this
//   socket.on('disconnect', () => {
//     console.log('disconnect');
//     if (addedUser) {
//       --numUsers;

//       // echo globally that this client has left
//       socket.broadcast.emit('user left', {
//         username: socket.username,
//         numUsers: numUsers
//       });
//     }
//   });
// });
