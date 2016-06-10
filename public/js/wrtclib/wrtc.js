'use strict';


/**
 * RTCConfiguration
 *
 * http://dev.w3.org/2011/webrtc/editor/webrtc.html#idl-def-RTCConfiguration
 *
 * Default STUN и TURN-servers
 * To be overriden from server by 'config' message
 **/
var rtcConfiguration = { iceServers: [
//  { "url": "stun:stun.stunprotocol.org:3478" }
//  { "url": "stun:stun.l.google.com:19302" }
//  { "url": "turn:demo@wrtc.ru", "credential": "testing" }
//  { "url": "turn:demo@wrtc.ru", "credential": "testing" }
] };



// Just a stub for future API


var Wrtc = function(options) {
  var self = this;

  Emitter(self);

  self.logged = false;

  self.transport = new SocketTransport();
  self.localUser = new wrtc.LocalUser();

  wrtc.transport = self.transport; // backward compatibility to old API
  wrtc.localUser = self.localUser; // backward compatibility to old API

  //

  self.userList = new UserList();

  // Transport events

  self.transport.on('message', function (dataObject) {
    debug.debug('self.transport.on(\'message\'): ' + JSON.stringify(dataObject, null, 2) + '');

    self.emit(dataObject.name, dataObject);

    // backward compatibility to old API
    if (typeof socketOnMessage !== 'undefined') {
      socketOnMessage(dataObject);
    }
  });


  self.transport.on('reconnect', function () {
    if (self.logged) {
      self.relogin();
      self.rejoin();
    }
  });


  // Application events

  self.on(MESSAGES.ADD_TO_ROOM, function () {  // User was forced added to room by other party and need to initiate connection
    wrtc.roomId = data.roomId;                // Set the global roomId we were invited to
    debug.info('Was added to room ' + wrtc.roomId + '...');

    self.hello();
  });

  self.on(MESSAGES.NOTIFY, function (data) {
    self.userList.onNotify(data);
  });


  self.on(MESSAGES.CONFIG, function (objMessage) {
    console.log('doConfig()');

    if (objMessage.data && objMessage.data.iceServers) {

      var servers = objMessage.data.iceServers;
      //{ protocol: 'turn', hostname: turn_hostname, port: turn_port, username: cred.username, password: cred.credential }
      //{ url: "turn:"+cred.username+"@"+turn_url, credential: cred.credential }
      //rtcConfiguration = data.data;

      debug.warn('doConfig(): Limited support for array of ICE Servers');
      servers.forEach(function (server) {
        // Chrome old format:
        //  { iceServers: [ {url: "turn:username@host", credential: "password" } ] };
        // Firefox format (and new Chrome):
        //  { iceServers: [ { url: "turn:host" , username: "username" , credential: "password"} ] }
        //
        var url = server.protocol + ':' + server.hostname +
          ( server.port ? ':' + server.port : '' ) +
          ( server.transport ? '?transport=' + server.transport : '' );

        var item = createIceServer(url, server.username, server.password);
        // var item = createIceServers( [url], server.username, server.password);

        debug.debug('doConfig(): adding ICE Server' +
          ': server: ' + JSON.stringify(server) +
          '; item:' + JSON.stringify(item));

        rtcConfiguration.iceServers.push(item);
      });
    }
  });


  //

  /**
   * Каждое сообщение, отправляемое через веб-сокеты, будет содержать имя сообщения, идентификаторы отправителя и получателя (или null, если это широковещательное сообщение), и собственно данные
   *
   * @param eventName
   * @param {ConnectionUser} remoteUserObj
   * @param connId
   * @param data
   */
  self.sendEvent = function(eventName, remoteUserObj, connId, data) {

    if (!eventName) { throw 'sendEvent(): eventName is empty.'; }

    var msg = {
      'name':   eventName,
      'roomId': self.roomId,
      'from':   self.localUser.getUser(),
      'to':     remoteUserObj,
      connId:   connId,
      'data':   data
    };
    socketSendString( JSON.stringify ( msg ) );
  };



  self.relogin = function () {
    socketEmit(
      MESSAGES.LOGIN, {
        user: wrtc.localUser.getUser(),
        auth: wrtc.localUser.auth
      },
      function(obj) {
        console.log('relogin result:', obj);
      }
    );
  };

  /**
   *
   * @param {{ name: string, roles: string[], auth: string }} userProfile
   */
  self.login = function (userProfile) {
    self.localUser.id = self.localUser.generateId(self.uidPrefix);
    self.localUser.name = userProfile.name;
    self.localUser.roles = userProfile.roles;
    self.localUser.auth = userProfile.auth;

    self.relogin();

    self.logged = true; // without awaiting for the result
  };

  self.text = function (text) {
    self.sendEvent(MESSAGES.TEXT, null, null, escape(text));
  };


  self.join = function (roomId, callback) {
    // Currently we track only one roomId
    self.roomId = roomId;

    socketEmit(MESSAGES.CREATE_ROOM, {roomId: roomId}, callback);
  };

  self.rejoin = self.join;

  self.hello = function () {
    self.sendEvent(MESSAGES.HELLO, null, null, null);
  };

  self.addParticipant = function (toUserId) {
    socketEmit(MESSAGES.ADD_TO_ROOM, {roomId: self.roomId, userId: toUserId});
  };


  self.publish = function (status) {
    var msg = {
      from: self.localUser,
      data: {status: status}
    };

    socketEmit(MESSAGES.PUBLISH, msg);
  };


  self.inviteExisting = function (userId) {
    if (!self.roomId) { self.createNewRoom(); }
    self.join(self.roomId);

    var href = encodeURIComponent(generateLink());

    var msg = {
      to: {id: userId, name: '-'},
      from: self.localUser,
      roomId: self.roomId,
      data: {href: href}
    };
    socketEmit(MESSAGES.INVITE_URL, msg);

  };

  self.inviteNew = function (userId) {
    self.createNewRoom();
    self.inviteExisting(userId);
  };

  self.inviteTextChat = function (userId) {
    self.createNewRoom();

    self.join(wrtc.roomId);
    //socketEmit(MESSAGES.CREATE, {roomId: wrtc.roomId});

    var href = encodeURIComponent(generateLink());

    var msg = {
      to: { id: userId, name: '-' },
      from: self.localUser,
      roomId: self.roomId,
      data: { href: href }
    };
    socketEmit(MESSAGES.INVITE_TEXT_CHAT, msg);
  };

  /**
   * Generate random roomId
   *
   * @returns {string}  - new roomId
   */
  self.createNewRoom = function() {
    self.roomId = 'room' + '_' + genStrId();

    // Trigger event
    if (typeof wrtcOnNewRoomCreated !== 'undefined' && wrtcOnNewRoomCreated) {
      console.warn('wrtcOnNewRoomCreated deprecated. Use wrtc.on(\'room-create\' instead.)');
      wrtcOnNewRoomCreated(self.roomId);
    }
    self.emit('create-room', self.roomId);

    return self.roomId;
  };

  /**
   *
   */
  self.reconnect = function() {
    doHangupAll();
    self.hello();
  };


};
