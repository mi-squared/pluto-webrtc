'use strict';

console.log('index.js: start');

var INIT_TIMEOUT         = 100; //100;
var REQUIRE_WAIT_SECONDS = 30;

requirejs.config({
    //baseUrl: "http://.........."
    waitSeconds: REQUIRE_WAIT_SECONDS,
    paths: {
      //'socket.io':  '../socket.io/socket.io', // For unknown reason it takes too much time
      //'handlebars': '../3rdparty/common/handlebars'
    //},
    //shim: {
    //  'handlebars': {
    //    'exports': 'Handlebars'
    //  }
    }
  }
);

try {
  //var _define = define;

  // Undefine 'define' function of RequierJS to disable auto detection of AMD
  // as we use RequireJS only as loader and need all the modules to be in the global namespace.
  // Specifically, to trick Handlebars autodetection.

  define = 'undefined';

  //window.Handlebars =
  //  require(['../3rdparty/common/handlebars']);
  //define = _define;

  //define([ 'handlebars'
  //  '../3rdparty/common/handlebars'
  //]
  //  , function(Handlebars){
  //  window.Handlebars = Handlebars;
  //return {
  //  SampleTemplate: Handlebars.compile(SampleTemplateFile),
  //  MainMenuTemplate: Handlebars.compile(MainMenuFile)
  //};
  //}
  //);

  require([
    //  '../../../server/node_modules/socket.io',
    '../../../common/app_config',
    //'/socket.io/socket.io.js', // !!! we cannot use this location as this is for signalling server
    '../../../vendor/js/socket.io-0.9.16',
    //'../3rdparty/common/socket.io.0.9.16',
    //  '../3rdparty/common/socket.io-1.1.0',
    //    '../3rdparty/common/handlebars-v1.3.0',
    '../../../vendor/js/handlebars',
    '../../../vendor/js/lodash',
    '../../../vendor/js/ZeroClipboard',
    '../../../vendor/js/jquery.mousewheel',
    '../../../vendor/js/jquery.mCustomScrollbar',

    '../../3rdparty/webrtc/adapter_temasys.0.9.0.fix',
    //'../3rdparty/webrtc/adapter_temasys.0.8.770.fix',

    '../../../common/messages',

    '../../mylib/utils',
    '../../mylib/emitter',
    '../../mylib/attachable',
    '../../mylib/messageBox',
    '../../mylib/fullScreen',

    '../../wrtclib/user',
    '../../wrtclib/sdputils',

    //'../../wrtclib/localMedia/mediaConstraints'

  ], function(  /*arguments*/  ) {
    //for (var i = 0; i < arguments.length; i++) {
    //  console.log('loaded module:', arguments[i]);
    //}

    require([
      //'../../dist/prod/bundle-min',
      '../../dist/dev/wrtclib.bundle',

      '../../mylib/ticker',
      '../../mylib/socketTransport',
      '../../wrtclib/WebRTC',
      '../../wrtclib/mediaStreamController',
      '../../wrtclib/mediaSources',
      '../../wrtclib/mediaIce',

      //'../../wrtclib/connection/_RTCPeerConnection',
      //'../../wrtclib/connection/lwrtcPeerConnection',
      //'../../wrtclib/connection/wrtcPeerConnection',

      '../../wrtclib/_rtcStats',
      '../../wrtclib/mediaStats',
      '../../wrtclib/dtmf',
      '../../wrtclib/_dataChannel'
    ], function() {
      require([
        '../../wrtclib/mediaStreamView',
        '../../wrtclib/mediaSourcesView',

        //'../../wrtclib/localMedia/detectRTC',
        // //'../../wrtclib/localMedia/captureUserMedia',
        // '../../wrtclib/localMedia/userMediaController',
        // '../../wrtclib/localMedia/localMedia',
        //'../../wrtclib/connection/connection',
        //'../../wrtclib/connection/endpoint',
        //'../../wrtclib/containers/basicContainer',
        //'../../wrtclib/containers/videoContainer',
        //'../../wrtclib/containers/videoHolder',

        '../../wrtclib/mediaStatsView',

        '../../wrtclib/userList',

        '../../mylib/wrtcChat',


        '../../mylib/clipboard',

        //'inlineInstall',

        './conf',
        '../../wrtclib/wrtc',
        './init'//,
      ], function() {
        require([
          // ...
          './view-models/userListStatus',
          './view-models/dialogInviteEmail',
          './view-models/dialogUserListInvite',
          './ui'
        ], function() {
          // wait for INIT_TIMEOUT ms (taken from apprtc.appspot.com)

          //setTimeout(wrtcInit(), INIT_TIMEOUT);

          // For Temasys plugin before 0.8.794 WebRTCReadyCb() was called automatically after plugin initialization
          // and all the application Javascript code to be executed inside this callback
          //
          // For Temasys 0.8.794 and later and for all other browsers this code to be executed manually
          if (typeof plugin === 'undefined' || !plugin()) {
            // console.log('typeof plugin:', typeof plugin, '; plugin(): ', plugin());
            setTimeout(WebRTCReadyCb(), INIT_TIMEOUT);

          }

          // Emit event when load is finished
          // Now all the scripts are loaded, but initialization status is not known yet
          var event = new CustomEvent('wrtc-load-finished', {} );
          document.dispatchEvent(event);

          //document.onload = setTimeout(wrtcInit(), 1);
        });
      });
    });
  });

} finally {
  console.log('index.js: end');
}
