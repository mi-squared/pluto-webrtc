/**
 * Created by alykoshin on 7/25/14.
 */

"use strict";

var _Transport = function(spec) {
  var self = this;
  Emitter(self);

  self.onMessage = null;
  return self;
};

var WRTCTransport = function() {
  var self = new _Transport(spec);

};

var SocketTransport = function( spec ) {
  var self = new _Transport(spec);

  var socket;

  Object.defineProperty(self, "socket", {
    get: function () { return socket; }
  });

  spec = spec || {};
  self.onMessage = spec.onMessage || null;

  var baseURL = CONFIG.USE_SSL ?
    'https://' + CONFIG.HOSTNAME + ':' + CONFIG.HTTPS_PORT :
    'http://'  + CONFIG.HOSTNAME + ':' + CONFIG.HTTP_PORT ;

  var conn_opts = CONFIG.USE_SSL ? { secure: true } : null;

  ///** Обработчики событий при поступлении сообщений через веб-сокеты:
  // *
  // * @param {string} textData
  // */
  //function onSocketMessage( textData ) {
  //  //console.log('!!! onSocketMessage:', textData);
  //  self.emit('message', JSON.parse(textData));
  //
  //  if (self.onMessage) {
  //    self.onMessage( textData );
  //  }
  //}

  /** Public methods **/

  /**
   *
   */
  self.connect = function() {
    debug.info('SocketTransport.connect(): baseURL:', baseURL);

    socket = io.connect( baseURL, conn_opts ); // Connection through web-sockets

    //socket.on('message', onSocketMessage );
    socket.on('message', function(textData) {
      self.emit('message', JSON.parse(textData));
    });

    socket.on('reconnect',  function(attempt) { self.emit('reconnect'); } );

    // Debug socket status:

    socket.on('connect',    function() { debug.log('socket.on(\'connect\')'); } );
    socket.on('error',      function(error) { debug.log('socket.on(\'error\'), error:', error); } );
    socket.on('disconnect', function() { debug.log('socket.on(\'disconnect\')'); } );
    socket.on('reconnect',  function(attempt) { debug.log('socket.on(\'reconnect\'), attempt:', attempt); } );
    socket.on('reconnect_attempt', function() { debug.log('socket.on(\'reconnect_attempt\')'); } );
    socket.on('reconnecting',      function(attempt) { debug.log('socket.on(\'reconnecting\'), attempt:', attempt); } );
    socket.on('reconnect_error',   function(error) { debug.log('socket.on(\'reconnect_error\'), error:', error); } );
    socket.on('reconnect_failed',  function() { debug.log('socket.on(\'reconnect_failed\')'); } );
  };

  /**
   *
   * @param {string} str
   * @param {function} callback
   */
  self.sendString = function ( str, callback  ) {
    debug.debug('socket.send():', JSON.stringify( JSON.parse(str), null, 2));
    socket.send(str, callback );
    //self.sendObject('message', , callback );
  };

  /**
   *
   * @param {string} eventName
   * @param {object} dataObject
   * @param {function} callback
   */
  self.sendObject = function ( eventName, dataObject, callback ) {
    if (!eventName) { throw 'sendObject(): eventName is empty.'; }
    debug.debug('socket.emit(): eventName:', eventName, '; dataObject:', JSON.stringify(dataObject, null, 2));

    socket.emit( eventName, dataObject, callback );
  };

  self.connect();

  return self;
};



//
// Not intended to be in socketTransport as it is more app-specific
//

/**
 * Set userId for local user
 * and transmit it to server to set it for server-side socket
 *
 * @param {string} userId
 */
//function sendUserInfo() {
  // set userId for the socket
  //userId = userId ? userId : socket.socket.sessionid;
  //userId = userId ? userId : transport.socket.sessionid;
  //debug.log('sendUserInfo(): userId:', userId, '; transport.socket.sessionid:', transport.socket.sessionid);
  // Set local value
  //localId = userId;

  // Send to server to set variable for the socket
  //socketEmit(MESSAGES.LOGIN, { user: wrtc.localUser.getUser() } );
//}

/**
 * Send string to socket
 *
 * @param str
 * @param callback
 */

function socketSendString( str, callback  ) {
  //debug.debug('socketSendString: str:', str);
  window.wrtc.transport.sendString( str, callback  );
}

/**
 *
 * @param eventName
 * @param object
 * @param callback
 */
function socketEmit( eventName, object, callback ) {
  //debug.debug('socketEmit: eventName:', eventName, '; object:', object);
  window.wrtc.transport.sendObject(eventName, object, callback);
}

