/**
 * Created by alykoshin on 17.09.15.
 */
'use strict';

var io         = require('socket.io');

var MESSAGES   = require('../public/common/messages.js').MESSAGES;
var USER_STATUS= require('../public/common/messages.js').USER_STATUS;

var wrtcMailer = require('./mailer.js');
var turn       = require('./turn.js');
var userRoles  = require('./userroles.json');

var SOCKET_USER_OBJECT = 'userObj';

var WrtcSignalling = function(server) {

  var self = this;

  self.ioSocket = io.listen(server);


  function getSocketByUserId(userId, callback) {
    // Iterate all the sockets and find this userId
    self.ioSocket.sockets.clients().forEach( function(sock) {

      // Get user object
      self.getUserFromSocket(sock, function(socketUserObj, socketUserStatus) {

        // Is this the user we are searching for
        if ( socketUserObj && socketUserObj.id === userId ) {

          console.log('thisSocket with userId \''+socketUserObj.id+'\' found');
          if (callback) { callback( sock ); }
        }
      });
    });
  }

  self.getUserFromSocket = function(socket, callback) {
    // retrieve user's {name, id} of the disconnecting socket
    socket.get(SOCKET_USER_OBJECT, function(err, userObj) {
      if (err) {
        console.log('getUserFromSocket(): err:', err);
        userObj = null;
      }
      console.log('socket.get(SOCKET_USER_OBJECT): userObj:', userObj);
      var user   = userObj && userObj.user;
      var status = userObj && userObj.status;
      if (callback) { callback(user, status); }
    });
  };

  self.checkRole = function(roles1, action, resources) {
    for (var len1=roles1.length, i1=0; i1<len1; ++i1) {
      var roleName1 = roles1[i1];
      var roleDefinition = userRoles[roleName1];
      var actionRights = roleDefinition && roleDefinition[action];

      for (var len2=resources.length, i2=0; i2<len2; ++i2) {
        var resourceName = resources[i2];
        if (actionRights && actionRights[resourceName] === true) {
          return true;
        }
      }
    }
    return false;
  };


  /**
   * 
   * @param {ConnectionUser} fromUser
   * @param {ConnectionUser}toUser
   * @param toSocket
   * @param {string} newStatus
   * @private
   */
  self._notify = function(fromUser, toUser, toSocket, newStatus) {
    // Check user roles

    // toUser view fromUser, i.e. toUser can view notifications fromUser
    if ( !self.checkRole(toUser.roles, 'view', fromUser.roles) ) { return; }

    // Send notification
    var outMsg = {
      name:   MESSAGES.NOTIFY,
      //roomId: null,
      from:   fromUser,
      //connId: null,
      //to:     null,
      data:   { status: newStatus }
    };
    toSocket.send(JSON.stringify(outMsg));
  };
  
  self.doNotifyThis = function(thisSocket, thisUser) {
    // Iterate all sockets
    self.ioSocket.sockets.clients().forEach(function(otherSock) {
      // Get other user information
      self.getUserFromSocket(otherSock, function(otherUser, otherStatus) {
        if (otherUser && otherUser.id !== thisUser.id) {
          // Send to current logging-in user
          self._notify(otherUser, thisUser, thisSocket, otherStatus);
        }
      });
    });
  };

  self.doNotifyOthers = function(thisSocket, newStatus) {
    console.log('doNotifyOthers()');

    self.getUserFromSocket(thisSocket, function(thisUser, thisUserStatus) {
      console.log('doNotifyOthers(): thisUser:', thisUser);
      if (!thisUser) return;      
      
      // Send of thisUser to everybody
      // Iterate all sockets
      self.ioSocket.sockets.clients().forEach(function(otherSocket) {
        // Get otherUser information
        self.getUserFromSocket(otherSocket, function(otherUser, otherUserStatus) {
          if (otherUser && otherUser.id !== thisUser.id) {
            // Send status of thisUser to otherUser
            self._notify(thisUser, otherUser, otherSocket, newStatus);
          }
        });
      });

    });
  };

  self.doDisconnect = function(thisSocket) {
    self.getUserFromSocket(thisSocket, function(origUserObj, origUserStatus) {
      self.socketHangupOthers(thisSocket, origUserObj);
    });
  };

  self._hangup = function(thisSocket, roomId, fromUser) {
    var outMsg = {
      name:   MESSAGES.HANGUP,
      roomId: roomId,
      from:   fromUser//,
      //connId: null,
      //to:     null,
      //data:   null
    };
    thisSocket.broadcast.to(roomId).send(JSON.stringify(outMsg));
  };
  
  self.socketHangupOthers = function(thisSocket, fromUser) {
    // Iterate all rooms thisSocket was joined and send 'hangup'
    var roomIds = self.ioSocket.sockets.manager.roomClients[thisSocket.id];

    for (var roomId in roomIds) { if (roomIds.hasOwnProperty(roomId)) {
        roomId = roomId.substr(1); // remove leading '/'
        if (roomId) { // send only to clients in registered rooms, not to default room with empty name
          console.log('socketHangupOthers(): broadcasting hangup to room \'' + roomId + '\'');

          self._hangup(thisSocket, roomId, fromUser);
        }
    }}
  };


  self.socketSendConfig = function(thisSocket) {

    var outMsg = {   // rtcConfiguration
      'name': MESSAGES.CONFIG,
      'data': {
        'iceServers': turn.getIceServers()
      }
    };

    thisSocket.send(JSON.stringify(outMsg));
  };

  self.doSendEmail = function(emailData) {
    console.log('socket.on(\'message\'): doSendEmail(): emailData: ' + JSON.stringify(emailData));

    wrtcMailer.sendInvite(
      emailData.nameFrom,
      emailData.addressFrom,
      emailData.addressTo,
      emailData.url
    );
  };


  // Handle sockets.io connections
  self.ioSocket.sockets.on('connection', function onConnection(thisSocket) {

    // Create new room (and immediately join it as first user)
    thisSocket.on(MESSAGES.CREATE_ROOM, function(inMsg) {
      console.log('thisSocket.on(\'create\'): inMsg.roomId', inMsg.roomId);
      thisSocket.join(inMsg.roomId);
    });

    // Store in thisSocket received from client {name, id}
    thisSocket.on(MESSAGES.LOGIN, function(inMsg, fn) {
      var user = inMsg.user,
        status = USER_STATUS.ONLINE;
      console.log('thisSocket.on(\'LOGIN\'): user:', user);

      // Send to connecting user list with statuses of all other users
      self.doNotifyThis(thisSocket, user);
      
     // Store user info in the socket
      thisSocket.set(SOCKET_USER_OBJECT, { user: user, status: status }, function() {
        console.log(' thisSocket.on(MESSAGES.LOGIN): thisSocket.set(SOCKET_USER_OBJECT)');
        // Inform others
        self.doNotifyOthers(thisSocket, status);

        if (fn) { fn(user); }
      });
    });

    // Add other participant to our room

    thisSocket.on(MESSAGES.ADD_TO_ROOM, function( inMsg ) {
      //var roomId = inMsg.roomId,
      //  userId = inMsg.userId;
      console.log('thisSocket.on(\'ADD_TO_ROOM\'): inMsg.roomId', inMsg.roomId, '; inMsg.userId:', inMsg.userId);
      getSocketByUserId(inMsg.userId, function(sock) {
        sock.join(inMsg.roomId, function() { // join User to the Room
          sock.send(JSON.stringify(inMsg) );
        });
      });
    });

    // При получении любого сообщения перешлем его всем остальным (кроме отправителя)
    thisSocket.on('message', function(textData) {
      console.log('thisSocket.on(\'message\'): textData:\'' + textData + '\'');

      var jdata;

      try {
        jdata = JSON.parse(textData);

      } catch(err) {
        console.log('Invalid message ignored: err:', err, '; textData:', textData);
        return;
      }

      if (jdata.name === MESSAGES.SEND_EMAIL) {
        self.doSendEmail(jdata.data);
      }

      console.log('thisSocket.broadcast.to(\''+jdata.roomId+'\').send(' + textData +')');
      thisSocket.broadcast.to(jdata.roomId).send(textData);
    });


    thisSocket.on(MESSAGES.PUBLISH, function(inMsg) {
      console.log('thisSocket.on(\'publish\') inMsg:', inMsg);

      thisSocket.set(SOCKET_USER_OBJECT, { user: inMsg.from, status: inMsg.data.status }, function() {
        // Inform others
        self.doNotifyOthers(thisSocket, inMsg.data.status);
      });
    });


    thisSocket.on(MESSAGES.INVITE_URL, function(inMsg) {
      console.log('thisSocket.on(\'INVITE_URL\') inMsg:', inMsg);
      getSocketByUserId(inMsg.to.id, function(sock) {
        var outMsg = inMsg;
        outMsg.name = MESSAGES.INVITE_URL;
        sock.send(JSON.stringify(outMsg) );
      });

    });

    thisSocket.on(MESSAGES.INVITE_TEXT_CHAT, function(inMsg) {
      console.log('thisSocket.on(\'INVITE\') inMsg:', inMsg);
      getSocketByUserId(inMsg.to.id, function(sock) {
        var outMsg = inMsg;
        outMsg.name = MESSAGES.INVITE_TEXT_CHAT;
        sock.send(JSON.stringify(outMsg) );
      });

    });

    // When one of participants disconnects, send hangup with his identifier to all other participants
    thisSocket.on('disconnect', function() {
      console.log('thisSocket.on(\'disconnect\')');
      self.doDisconnect(thisSocket);
      self.doNotifyOthers(thisSocket, USER_STATUS.OFFLINE);
    });

    self.socketSendConfig(thisSocket);

  });
};
/*var ID_LENGTH = 10;

 // Simplest way to pad number with leading zeroes
 function pad(num, len) {
 var s = num + "";
 while (s.length < len) s = "0" + s;
 return s;
 }

 function genId() {

 //    console.log('need to check uniqueness!');

 var r = Math.floor(( Math.random()* Math.pow(10, ID_LENGTH) )+1);
 return pad(r, ID_LENGTH);
 }*/

/*app.get('/', function(req, res, next) {
 console.log('app.get(\'/\')', req.body);

 res.render('index.html', { roomId: genId(), userId: genId() } );
 });

 app.post('/createRoom', function(req, res, next) {
 console.log('app.post(\'/createRoom\')', req.body);

 //var roomId  = req.body.roomId;
 //var userId = req.body.userId;
 var roomId = genId();
 var userId = genId();

 if ( !roomId || !userId ) {
 return res.send('Error 400: Invalid parameters.', 400);
 }

 var linkToJoin = 'http://localhost:3002/joinRoom?roomId=' + roomId;
 res.render('conf.html', { roomId: roomId, userId: userId, action: 'createRoom', linkToJoin: linkToJoin } );
 });
 */

/*app.get('/Patient.html', function(req, res, next) {
 console.log('app.get(\'/Patient.html\')', req.body);

 var roomId = genId();
 var userId = genId();

 //var hostname = 'localhost';
 var hostname = '184.72.220.242';

 var linkToJoin = 'http://'+hostname+':'+HTTP_PORT+'/Patient.html?roomId=' + roomId;
 res.render('Patient.html', { roomId: roomId, userId: userId, action: 'createRoom', linkToJoin: linkToJoin } );
 });*/

/*
 app.post('/waitInvite', function(req, res, next) {
 console.log('app.post(\'/waitInvite\')', req.body);

 */
/*var roomId  = req.body.roomId;*//*

 var userId = req.body.userId;

 if ( */
/*!roomId ||*//*
 !userId ) {
 return res.send('Error 400: Invalid parameters.', 400);
 }

 res.render('conf.html', { */
/*roomId: roomId,*//*
 userId: userId, action: 'waitInvite' } );
 });

 app.get('/joinRoom', function(req, res, next) {
 console.log('app.get(\'/joinRoom\')', req.body);

 var roomId  = req.query.roomId;
 //var userId = req.query.userId;

 // Regenerate userId
 var userId = genId();

 if ( */
/*!roomId ||*//*
 !userId ) {
 return res.send('Error 400: Invalid parameters.', 400);
 }

 res.render('conf.html', { roomId: roomId, userId: userId, action: 'joinRoom' } );
 });
 */


module.exports = function(server) { return new WrtcSignalling(server); };
