// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3001;
server.listen(3001);

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

var numUsers = 0;
var users = {};

io.on('connection', (socket) => {
  var addedUser = false;
  console.log('a user connected');

  // socket.on('new message', (data, room, name) => {
  //   console.log(room)
  //   console.log(room + 'has one message: ' + data)

  //   socket.to(room).emit('client message', {
  //     name: name,
  //     message: data,
  //   });
  // })

  //監聽用户發布的聊天内容
  socket.on('message', function (obj) {
    //向所有客户端廣播發布的消息
    var mess = {
      username: obj.username,
      msg: obj.msg,
      // img: obj.img,
      roomid: obj.room,
      time: obj.time
    }
    console.log(mess.roomid)
    io.to(mess.roomid).emit('message', mess)
    console.log(obj.username + '對房' + mess.roomid + '說：' + mess.msg)
  })

  socket.on('login', (data) => {
    console.log(data)
    console.log(data.name + '加入了' + data.roomid)

    socket.name = data.name
    socket.room = data.roomid

    if (!users[data.roomid]) {
      users[data.roomid] = {}
    }
    users[data.roomid] = data
    socket.join(data.roomid)
    io.to(data.roomid).emit('login', users[data.roomid])
  })
  socket.on('logout',function (obj) {
    try{
      console.log(obj.name + '退出了' + obj.roomid)
      delete users[obj.roomid]
      io.to(obj.roomid).emit('logout', users[obj.roomid])
      socket.leave(obj.roomid)
    } catch (e) {
      console.log(e)
    }
  })

  socket.on('disconnect', function () {
    console.log(socket.room, socket.name);
    if (users[socket.room] && users[socket.room].hasOwnProperty(socket.name)) {
      delete users[socket.room][socket.name]
      // 退出聊天室
      global.logger.info(socket.name + '退出了' + socket.room)
      socket.leave(socket.roomid)
      io.to(socket.room).emit('logout', users[socket.room])
    }
  })

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    console.log('add user');
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    console.log(numUsers);
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    console.log('typing');
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    console.log('stop typing');
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // socket.on('disconnect', (obj) => {
  //   console.log('disconnect');
  //   if (addedUser) {
  //     --numUsers;

  //     // echo globally that this client has left
  //     socket.broadcast.emit('user left', {
  //       username: socket.username,
  //       numUsers: numUsers
  //     });
  //   }
  // });
});
