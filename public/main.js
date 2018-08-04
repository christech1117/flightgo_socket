$(function () {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

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
  
  const addParticipantsMessage = (data) => {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  const setUsername = () => {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      //#### get CustomerService User token
      console.log("customService login")
      //authCustomerServiceUser("customerService1@gmail.com", "customerService1")

      // {
      //   "id": "5b4e17e4546347baaf930d8c",
      //   "name": "曾月青",
      //   "picture": "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon",
      //   "providerId": "1589453831",
      //   "email": "customerservice1@gmail.com",
      //   "createdAt": "2018-07-17T16:23:00.876Z"
      // }
      // console.log("AUTH3")
      // Tell the server your username
      //socket.emit('add user', username);

      // data = {
      //   "userId": data.userId,
      //   "providerId": data.providerId,
      //   "customerServiceId": data.customerServiceId,
      //   "roomId": data.roomId,
      // }

      // Pick UP
      socket.emit(events.pickUp, {
        type: "customerservice",
        userId: "U7d9b155b96a70afe8607c227b9768677",
        providerId: "1597108460",
        customerServiceId: "5b4e17e4546347baaf930d8c",
        customerServiceName: "曾月青",
        roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677",
      })

      // CS Joined
      socket.emit(events.customerServiceJoined,
        {
          type: "customerservice",
          providerId: "1597108460",
          userId: "U7d9b155b96a70afe8607c227b9768677",
          customerServiceId: "5b4e17e4546347baaf930d8c",
          roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
          name: "曾月青",
          picture: "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon"
        })
      connected = true;
      console.log("#####")
    }
  }

  const authCustomerServiceUser = function (email, password) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://flightgo-backend-dev.herokuapp.com/auth",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Basic Y3VzdG9tZXJTZXJ2aWNlMUBnbWFpbC5jb206Y3VzdG9tZXJTZXJ2aWNlMQ==",
        "Cache-Control": "no-cache"
      },
      "processData": false,
      "data": "{\"access_token\": \"1gnEhIylRyg3gFe3nXuxhAxZKIbPIZr9\"\n}",
    }

    $.ajax(settings).done(function (response) {
      console.log("AAA");
      console.log(response);
      token = response.token
      user = response.user
      console.log(user)
      console.log(token)
      //#### et CustomerService User
      getCustomServiceUserMe(token)
      console.log('responseUserMe', responseUserMe)
    });
  }

  const getCustomServiceUserMe = function (token) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://flightgo-backend-dev.herokuapp.com/users/me?access_token=" + token,
      "method": "GET",
      "headers": {
        "Content-Type": "application/json",
      },
      "processData": false,
      "data": "{\n\t\"access_token\": \"1gnEhIylRyg3gFe3nXuxhAxZKIbPIZr9\"\n}"
    }

    $.ajax(settings).done(function (response) {
      console.log(response);
      responseUserMe = {
        id: response.id,
        name: response.name,
        providerId: response.providerId
      }
      socket.emit('add user', {
        id: responseUserMe.id,
        name: responseUserMe.name,
        providerId: responseUserMe.providerId,
        roomId: "",
      });
    });
  }

  // Sends a chat message
  const sendMessage = () => {
    console.log("sendMessage");
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        type: "customerservice",
        providerId: "1597108460",
        userId: "U7d9b155b96a70afe8607c227b9768677",
        customerServiceId: "5b4e17e4546347baaf930d8c",
        roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
        name: "曾月青",
        picture: "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon",
        username: "曾月青",
        message: message
      });
      // tell server to execute 'new message' and send along one parameter

      // socket.emit('new message', message);
      console.log({
        type: "customerservice",
        username: username,
        message: message
      })
      console.log('SEND MESSAGE')
      socket.emit(events.newMessage,
        {
          type: "customerservice",
          providerId: "1597108460",
          userId: "U7d9b155b96a70afe8607c227b9768677",
          customerServiceId: "5b4e17e4546347baaf930d8c",
          roomId: "1597108460_U7d9b155b96a70afe8607c227b9768677_5b4e17e4546347baaf930d8c",
          name: "曾月青",
          picture: "https://gravatar.com/avatar/53f08004c8f872af684ba2391f25690f?d=identicon",
          message: message
        })

      // socket.emit('new message', {
      //   type: "customerservice",
      //   username: username,
      //   message: message
      // }); // be object
    }
  }

  // Log a message
  const log = (message, options) => {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  const addChatMessage = (data, options) => {
    console.log('addChatMessage', data)
    
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      // .text(data.username)
      // .css('color', getUsernameColor(data.username));
      .text(data.userId)
      .css('color', getUsernameColor(data.userId));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      // .data('username', data.username)
      .data('username', data.userId)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  const addChatTyping = (data) => {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  const removeChatTyping = (data) => {
    getTypingMessages(data).fadeOut(() => {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el, options) => {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  const cleanInput = (input) => {
    return $('<div/>').text(input).html();
  }

  // Updates the typing event
  const updateTyping = () => {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  const getTypingMessages = (data) => {
    return $('.typing.message').filter(i => {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  const getUsernameColor = (username) => {
    console.log('getUsernameColor' , username)
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        console.log('username', username);
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', () => {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(() => {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(() => {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', (data) => {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on(events.newMessage, (data) => {
    console.log(events.newMessage, data)
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', (data) => {
    log(data.username + ' joined');

    console.log('user joined', data)
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', (data) => {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', (data) => {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', (data) => {
    removeChatTyping(data);
  });

  socket.on('disconnect', () => {
    log('you have been disconnected');
  });

  socket.on('reconnect', () => {
    log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', () => {
    log('attempt to reconnect has failed');
  });

});
