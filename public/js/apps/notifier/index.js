'use strict';

var event = new CustomEvent('wrtc-load-started', {} );
document.dispatchEvent(event);

var INIT_TIMEOUT         = 100; //100;
var REQUIRE_WAIT_SECONDS = 30;

requirejs.config({
    waitSeconds: REQUIRE_WAIT_SECONDS,
    paths: {
      //'socket.io':  '../socket.io/socket.io', // For unknown reason it takes too much time
    }
  }
);

try {
  // Undefine 'define' function of RequierJS to disable auto detection of AMD
  // as we use RequireJS only as loader and need all the modules to be in the global namespace.
  // Specifically, to trick Handlebars autodetection.
  define = 'undefined';

  require([
    //'/socket.io/socket.io.js', // !!! we cannot use this location as this is for signalling server
    '../../../vendor/js/socket.io-0.9.16',
    '../../../common/app_config',
    '../../../common/messages',
    '../../../js/mylib/utils',
    '../../../js/mylib/emitter',
    '../../../js/wrtclib/user',
    '../../mylib/socketTransport'
  ], function( /* arguments */ ) {
    require([
      '../../../js/wrtclib/wrtc'
    ], function() {

      //function socketOnMessage(dataInText) {
      //  var data = JSON.parse(dataInText);

        //var localId = wrtc.localUser.getUser().id;

        //debug.groupCollapsed('socketOnMessage(\'' + data.name +'\')');
        //debug.log('socketOnMessage(' + dataInText + ')');
        //
        //if ( data.name === MESSAGES.INVITE ) {
        //  if (typeof window.wrtc.onInvite !== 'undefined') { window.wrtc.onInvite(data); }
        //}
      //}
      //
      //window.wrtc.transport = new SocketTransport( { onMessage: socketOnMessage } );

      //window.wrtc.setUserInfo = function(userObj) {
      //  if (userObj.name) { window.wrtc.userName = userObj.name; }
      //};

      //window.wrtc.transport.

      //if (window.wrtc.onReady) { window.wrtc.onReady(window.wrtc); }

      var event;
      // Emit event when load is finished
      event = new CustomEvent('wrtc-load-finished', {} );
      document.dispatchEvent(event);

      // Emit event when init is finished
      // For compatibility with full version
      event = new CustomEvent('wrtc-init-finished', {} );
      document.dispatchEvent(event);

    });
  });

} finally {
  console.log('index.js: end');
}
