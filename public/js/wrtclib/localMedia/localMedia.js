/**
 * Created by alykoshin on 3/21/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug     = require('./../../mylib/utils.js').debug;
  var UserMedia = require('./userMediaController.js');
  //var mediaConstraints = require('./mediaConstraints.js').MediaConstraints;
  var VIDEO = require('./mediaConstraints.js').VIDEO;
}

//var
//  SHOW_INACTIVE_VIDEO  = false,//false,
//  SHOW_ACTIVE_VIDEO    = true,
//  SHOW_INACTIVE_SCREEN = false, //false,
//  SHOW_ACTIVE_SCREEN   = true;
//
//var POSTER_VIDEO    = '/images/wrtc_poster_video.png';
//var POSTER_SCREEN   = '/images/wrtc_poster_screen.png';
//var POSTER_NO_VIDEO = '/images/wrtc_poster_user.png';

var DEFAULT_PREVIEW_SIZE = VIDEO.SIZE_320x240;


// Local stream object

//var localMediaBase = function() {
//  var that = {};
//  return that;
//};
/**
 *
 * @param {number} localMediaIndex
 * @returns {UserMedia}
 * @constructor
 */
var LocalMedia = function(localMediaIndex) {

  var MSG_NO_ACCESS = 'No access to audio/video',
    MSG_CANT_ACCESS = 'Cannot get access to media stream from local device',
    MSG_CANT_CAM_MIC = MSG_CANT_ACCESS + ' (camera/microphone).', /* + ' \n\n' +
   'Please make sure to enable chrome flag chrome://flags/#enable-usermedia-screen-capture ', */
    MSG_CANT_CAM_MIC_SCR = MSG_CANT_ACCESS + ' (camera/microphonee/screen capture).';

  var MSG_ERROR_TYPE_OLD = 'Old or incompatible browser',
    MSG_ERROR_NOT_SUPPORTED = 'Currently the browser you are using does not support webRTC.',
    MSG_SUPPORTED_BROWSERS = 'Supported browsers are:' +
      '\n'+'- <a href="https://chrome.google.com">Chrome</a>/Chromium (recommended)' +
      '\n'+'- <a href="http://getfirefox.com">Firefox</a> (with some limitations)' +
      (CONFIG.TEMASYS ? '\n'+'- IE10/11 with <a href=' + CONFIG.TEMASYS.DOWNLOAD.HOME + '>special plugin</a>' : '')+
      '';

  var MSG_ERROR_TYPE_INIT = 'Error initializing video conference',
    MSG_IE10 = 'Unfortunately we only support Internet Explorer-10 for video/audio conference. ' +
      'We are working on making it compatible with other latest versions also. ',
    MSG_ERROR_NEED_PLUGIN= 'Your browser does not support video conference. Please download plugin.';

  var MSG_DOWNLOAD = 'Download plugin...',
    MSG_DOWNLOAD_START = 'Plugin download will start automatically in several seconds...\n',
    MSG_DOWNLOAD_FROM_TROUBLES = 'If you experience troubles with automatic download, you can download plugin from\n',
    MSG_DOWNLOAD_FROM_HOME = CONFIG.TEMASYS ? '<a href='+CONFIG.TEMASYS.DOWNLOAD.HOME+'>Download page</a>\n' : '',
    MSG_DOWNLOAD_FROM = (CONFIG.TEMASYS && CONFIG.TEMASYS.DOWNLOAD.HOME) ? MSG_DOWNLOAD_FROM_TROUBLES + MSG_DOWNLOAD_FROM_HOME : '', // If downloads homepage is set in config
    MSG_UNINSTALL = 'Please, make sure you uninstalled any previous version of plugin before installing this one!';

  var self = new UserMedia();

  //var x, y;

  //  self.localMediaIndex = localMediaIndex;
  self.vid             = null;
  self.mediaType       = null;  /** Defined as MEDIA_TYPE.VIDEO, SCREEN **/
  self.mediaIndex      = localMediaIndex;


    //  /** Constraints for Audio+Video connection for Low and High Bandwidths **/
    //  self.AV_LOW = {
    //    audio: true,
    //    video: {
    //      mandatory: {
    ////          maxFrameRate: 1,
    //        maxWidth:  320,
    //        maxHeight: 240 /** 180-- Gives wide picture, by removing bottom and top **/
    //      },
    //      optional: [/*{maxWidth:320,maxHeight:180}, {maxWidth:320,maxHeight:240}*/]
    //    }
    //  };

    //  self.AV_HIGH = self.AV_HIGH || {
    //    audio: true,
    //    video: true
    //  };

  self.constraints   = self.constraints   || null;// { audio: true, video: true };

  /** Events **/

  self.onBeforeStart = self.onBeforeStart || null;
  self.onAfterStart  = self.onAfterStart  || null;
  self.onErrorStart  = self.onErrorStart  || null;

  self.onBeforeStop  = self.onBeforeStop  || null;
  self.onAfterStop   = self.onAfterStop   || null;

  //  self.showActive    = self.showActive    || true;
  //  self.showInactive  = self.showInactive  || false;

  //var super_onGetUserMediaSuccess = self.onGetUserMediaSuccess;
  /**
   * onGetUserMediaSuccess
   * @param newStream
   **/
  //self.onGetUserMediaSuccess = function (newStream) {
  self.on('start', function(newStream) {
    //    debug.groupCollapsed('LocalMedia.start(): onGetUserMediaSuccess()');
    debug.debug('LocalMedia.start(): onGetUserMediaSuccess(): ' +
      ': self.mediaType: ', self.mediaType ,
      '; newStream:',       newStream);

    //super_onGetUserMediaSuccess(newStream);

    self.vid.attach(self.stream);
    self.vid.setVisible();


    if (self.callback)     { self.callback();     }
    if (self.onAfterStart) { self.onAfterStart(); }

    //    debug.groupEnd();
  });
  //  self.onStart = function(stream) {
  //    self.vid.attach(self.stream);
  //    self.vid.setVisible();
  //  };


  //var super_onGetUserMediaError2 = self.onGetUserMediaError2;
  /**
   * onGetUserMediaError2
   * @param error
   */
  //self.onGetUserMediaError2 = function (error) {
  //self.onError = function (error) {
  //  super_onGetUserMediaError2(error);
  self.on('error', function() {
    if (get_browser() === 'Chrome') {
      // 4.If user is on Chrome , and user don't have camera or does not give acccess to camera then show alert
      // "Cannot get access to media stream from local device (camera/microphone).
      // Please make sure to enable chrome flag chrome://flags/#enable-usermedia-screen-capture "
      messageWrtc(MSG_NO_ACCESS, MSG_CANT_CAM_MIC, '', '' /* error */ /* Hide technical info */ );
    } else {
      messageWrtc(MSG_NO_ACCESS, MSG_CANT_CAM_MIC_SCR, '', '' /* error*/ /*Hide technical info*/);
    }
  });

  // Start local stream and call callback
  var super_start = self.start;
  self.start = function( callback ) {
    debug.log('LocalMedia.start(): self.mediaType:'+self.mediaType);

    if ( ! isWebRTCCompatible() ) {

      if (CONFIG.TEMASYS && (get_browser() === 'MSIE' || get_browser() === 'Safari') ) { // Need to check if we may work with plugin

        if (get_browser() === 'MSIE' && get_browser_version() !== '10' && get_browser_version() !== '11') {
          //        2.If browser is IE , and there is any error due to browser version. then show alert
          //        "Unfortunately we only support Internet Explorer-10 for video/audio conference.
          //        We are working on making it compatible with other latest versions also. "
          messageBox(MSG_ERROR_TYPE_INIT, MSG_IE10);

        } else {
          //       1.If browser is IE , and there is any error due to temasys plugin , then show alert
          //       Your browser does not support video conference. Please download plugin.
          //       And then when user click on OK button then automatically start download of plugin from our own server.
          var link;
          // Links from here: https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins          s
          if (get_browser() == 'MSIE') { // Windows
            link = CONFIG.TEMASYS.DOWNLOAD.IE;
          } else {
            link = CONFIG.TEMASYS.DOWNLOAD.SAFARI;
          } // Mac OS X
          var mb = messageBox(MSG_ERROR_TYPE_INIT, MSG_ERROR_NEED_PLUGIN);

          mb.onClose = function () {
            mb.onClose = null;
            window.location.href = link;
            messageBox(MSG_DOWNLOAD, MSG_DOWNLOAD_START + MSG_DOWNLOAD_FROM + MSG_UNINSTALL);
          };
        }
      } else {
        messageBox(MSG_ERROR_TYPE_OLD, MSG_ERROR_NOT_SUPPORTED, MSG_SUPPORTED_BROWSERS);
      }

    } else {
      self.callback = callback;
      if (self.isActive) { // If Local Media already started
        if (self.callback) { self.callback(); }
      } else {
        super_start();
      }
    }
    debug.groupEnd();
  };

  // Stop local stream
  var super_stop = self.stop;
  self.stop = function() {
    super_stop();
    detachMediaStream( self.vid.getVideo() );

    if (self.onAfterStop) { self.onAfterStop.call(); }
    self.vid.setVisible();
  };


  self.setLowBandwidth = function() {
    self.constraints.setMinMaxSize(null, VIDEO.SIZE_QVGA);
    self.constraints.setMinMaxFrameRate(null, 1);
  };

  var _dragstart = function(e) {
    MEDIA_TYPE.check(self.mediaType);

    if (self.mediaType !== MEDIA_TYPE.VIDEO) { return false; }
    e.dataTransfer.setData('source', 'localVideo');

    // Store id
    //e.dataTransfer.setData("_id", this._id);

    // FF & Chrome support
    var relX = e.offsetX ? e.offsetX : e.layerX;
    var relY = e.offsetY ? e.offsetY : e.layerY;
    //var absX = e.clientX;
    //var absY = e.clientY;
    e.dataTransfer.setData('relX', relX);
    e.dataTransfer.setData('relY', relY);
    e.dataTransfer.effectAllowed = 'move';
    // e.dataTransfer.setData("Text", e.target.getAttribute('id'));
    e.dataTransfer.setDragImage(e.target, relX, relY);
    return true;
  };

  var _dragover = function(ev) {
    ev.preventDefault();
  };

  var _drop = function(ev) {
    ev.preventDefault();
    // FF & Chrome support
    var x = ev.offsetX ? ev.offsetX : ev.layerX;
    var y = ev.offsetY ? ev.offsetY : ev.layerY;

    var origX = ev.dataTransfer.getData('relX');
    var origY = ev.dataTransfer.getData('relY');

    // if localVideo is under the pointer
    //if (e.target.className.indexOf('cardimg') !== -1) {
    if (ev.target.id === 'wrtcLocalVideoOverlay') {
      // we need to take into account its position relative to parent
      x += ev.target.parentElement.offsetLeft;
      y += ev.target.parentElement.offsetTop;
    }
    if (ev.dataTransfer.getData('source') === ('localVideo')) {
      var targetX = x - origX, targetY = y - origY;
      targetX = (targetX > 0) ? targetX : 0;
      targetY = (targetY > 0) ? targetY : 0;
      debug.debug('drop: x:',x,'; y:', y, '; origX:', origX, '; origY:', origY, '; targetX:', targetX, '; targetY:', targetY);
      //self.vid.toNearestCorner(targetX, targetY);
      //localVideo.setXY( targetX,  targetY );
      debug.log('LocalMedia.init(): drop(): Drag&drop disabled.');
    }
    ev.stopPropagation();
    return false;
  };

  self.init = function() {

    debug.log('LocalMedia.init(): - enter');
    debug.log('LocalMedia.init(): self.mediaType:' + self.mediaType + '; self.mediaIndex:' + self.mediaIndex);

    //var vidId = self.mediaType+'_'+self.mediaIndex;
    self.vid = LocalVideoHolder.add(self.mediaType, self.mediaIndex); //vidId);
    self.vid.setVisible();

    /** Set constraints to appropriate audio/video source (if set) **/
    debug.log('LocalMedia.init(): self.constraints.getValue():' + JSON.stringify(self.constraints.getValue() ) +
      '; self.vid: ', self.vid);

    self.vid.getContainer().ondragstart = _dragstart;
    document.body.ondragover          = _dragover;
    //    document.getElementById('wrtcLocalVideoContainer').ondragover = function(ev) {
    //    document.getElementById('wrtcLocalVideoOverlay').ondragover = function(ev) {
    //    document.getElementById('wrtcRemoteVideoHolder').ondragover = function(ev) {
    document.body.ondrop              = _drop;
    //    document.getElementById('wrtcLocalVideoOverlay').ondrop = drop;
    //    document.getElementById('wrtcLocalVideoContainer').ondrop = drop;
    //    document.getElementById('wrtcRemoteVideoHolder').ondrop = drop;

    debug.log('LocalMedia.init(): - exit');
  };

  return self;
};



var LocalVideo = function( localVideoIndex ) {
  var that = new LocalMedia( localVideoIndex );

  that.mediaType    = MEDIA_TYPE.VIDEO;
  that.mediaIndex   = localVideoIndex;

  /**
   * Id of preferred audio source (if set)
   *
   * property
   * @type {string|null}
   */
  that.audioSource = null;
  /**
   * Id of preferred video source (if set)
   * property
   * @type {string|null}
   */
  that.videoSource = null;

  /** Set constraints for video depending on the bandwidth option (low/high) **/
  var super_start = that.start;
  that.start = function( callback ) {
    //that.constraints = () ? that.AV_LOW : that.AV_HIGH;
    if (option_bw === BANDWIDTH.LOW) {
      that.setLowBandwidth();
      //      that.constraints.setMinMaxSize(null, VIDEO.SIZE_QVGA);
    }
    // that.constraints.setMinMaxFrameRate(null, 24);
    super_start( callback );
  };

  return that;
};



var LocalScreen = ( function() {
  var SCREEN_INDEX = 1; /** For Screen the number is always 0 **/
  var that = new LocalMedia( SCREEN_INDEX );
  that.mediaType = MEDIA_TYPE.SCREEN;


  /** We do not set low bandwidth as for Screen Share it will result in unusable low quality video **/
  that.constraints.setMinMaxSize(VIDEO.SIZE_2560x1440, VIDEO.SIZE_2560x1440);
  //that.constraints.setMinMaxFrameRate(null, 1);
  /* !!!                                                     */

  return that;
});


if (typeof module !== 'undefined') {
  module.exports.LocalVideo  = LocalVideo;
  module.exports.LocalScreen  = LocalScreen;
}

if (typeof window !== 'undefined') {
  window.LocalVideo   = LocalVideo;
  window.LocalScreen  = LocalScreen;
}
