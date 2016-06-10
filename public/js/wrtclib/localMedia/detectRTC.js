/**
 * Created by alykoshin on 9/23/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
}

// todo: need to check exact chrome browser because opera/node-webkit also uses chromium framework
var isChrome = !!navigator.webkitGetUserMedia;

// DetectRTC.js - github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
// Below code is taken from RTCMultiConnection-v1.8.js (http://www.rtcmulticonnection.org/changes-log/#v1.8)
var DetectRTC = {};

(function () {
  var screenCallback;

  var MSG_GET_SOURCE_ID = 'get-sourceId';
  var MSG_ARE_YOU_THERE = 'are-you-there';
  var MSG_EXT_LOADED    = 'rtcmulticonnection-extension-loaded';

  DetectRTC.screen = {

    chromeMediaSource: 'screen',

    getSourceId: function (callback) {
      if (!callback) { throw 'DetectRTC.screen.getSourceId(): "callback" parameter is mandatory.'; }
      screenCallback = callback;
      window.postMessage(MSG_GET_SOURCE_ID, '*');
      console.log('DetectRTC.screen.isChromeExtensionAvailable(): window.postMessage(\' '+MSG_GET_SOURCE_ID+' \', \'*\')');
    },

    isChromeExtensionAvailable: function (callback) {
      // if (!callback) { return; }

      if (DetectRTC.screen.chromeMediaSource === 'desktop') {
        console.log('DetectRTC.screen.isChromeExtensionAvailable(): DetectRTC.screen.chromeMediaSource === \'desktop\', callback(true);');
        if (callback) { callback(true); }
      }

      // ask extension if it is available
      window.postMessage(MSG_ARE_YOU_THERE, '*');
      console.log('DetectRTC.screen.isChromeExtensionAvailable(): window.postMessage(\''+MSG_ARE_YOU_THERE+'\', \'*\')');

      setTimeout(function () {
        if (DetectRTC.screen.chromeMediaSource === 'screen') {
          console.log('DetectRTC.screen.isChromeExtensionAvailable(): DetectRTC.screen.chromeMediaSource === \'screen\', callback(false);');
          if (callback) { callback(false); }
        } else {
          console.log('DetectRTC.screen.isChromeExtensionAvailable(): DetectRTC.screen.chromeMediaSource !== \'screen\', callback(true);');
          if (callback) { callback(true); }
        }
      }, 2000);
    },

    onMessageCallback: function (data) {
      console.log('DetectRTC.screen.onMessageCallback(): data:', data);

      // "cancel" button is clicked
      if (data == 'PermissionDeniedError') {
        DetectRTC.screen.chromeMediaSource = 'DetectRTC.screen.onMessageCallback(): PermissionDeniedError';
        if (screenCallback) { return screenCallback('DetectRTC.screen.onMessageCallback(): PermissionDeniedError'); }
        else { throw new Error('DetectRTC.screen.onMessageCallback(): PermissionDeniedError'); }
      }

      // extension notified his presence
      if (data == MSG_EXT_LOADED) {
        DetectRTC.screen.chromeMediaSource = 'desktop';
      }

      // extension shared temp sourceId
      if (data.sourceId) {
        DetectRTC.screen.sourceId = data.sourceId;
        if (screenCallback) { screenCallback(DetectRTC.screen.sourceId); }
      }
    }

  };


  DetectRTC.init = function() {

    window.addEventListener('message', function (event) {
      if (event.origin != window.location.origin) {
        return;
      }
      DetectRTC.screen.onMessageCallback(event.data);
    });

    // check if desktop-capture extension installed.
    if (window.postMessage && isChrome) {
      DetectRTC.screen.isChromeExtensionAvailable();
    }

    console.log('DetectRTC.screen.init(): DetectRTC.screen.chromeMediaSource', DetectRTC.screen.chromeMediaSource);
  }


})();


if (typeof module !== 'undefined') {
  module.exports.DetectRTC  = DetectRTC;
}

if (typeof window !== 'undefined') {
  window.DetectRTC  = DetectRTC;
}
