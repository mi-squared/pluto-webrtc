/**
 * Created by alykoshin on 7/17/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug     = require('./../../mylib/utils.js').debug;
  var Emitter   = require('./../../mylib/emitter.js');
  var DetectRTC = require('./detectRTC.js');
}

/**
 * @constrictor
 * @returns {__UserMedia}
 * @private
 */
var __UserMedia = function() {
  var self = this;

  Emitter(self);

  /**
   * @type {Object}
   * @private
   */
  self._constraints = null;

  /** low-level callbacks */
  self._onGetUserMediaSuccess = null;
  self._onGetUserMediaError   = null;

  /** Handlers */
  self._getUserMediaSuccess = function(newStream) {};
  self._getUserMediaError   = function(error)     {};

  self._getUserMedia = function() {
    debug.log('__UserMedia._getUserMedia(): self._constraints: ' + JSON.stringify(self._constraints));
    getUserMedia( self._constraints, self._getUserMediaSuccess, self._getUserMediaError );
  };

  return self;
};
/**
 *
 * @constrictor
 * @returns {_UserMedia}
 * @private
 */
var _UserMedia = function() {
  var self = new __UserMedia();
  /**
   * Local media stream from camera and microphone
   * @memberOf _UserMedia
   * @type {MediaStream}
   * @private
   */
  self._stream      = null;
//  /**
//   * Local media stream from camera and microphone
//   * @memberOf _UserMedia
//   * @type {Object}
//   */
//  Object.defineProperty(self, "stream", {
//    get: function () {
//      return self._stream;
//    }
//  });

  /**
   * @memberOf _UserMedia
   * @type {boolean}
   * @private
   */
  self._isWaitingUser = false;
  /**
   * @memberOf _UserMedia
   * @type {boolean}
   */
  Object.defineProperty(self, 'isWaitingUser', {
    get: function () {
      return self._isWaitingUser;
    }
  });
  /**
   * @memberOf _UserMedia
   * @type {boolean}
   * @private
   */
  self._isActive      = false;
  /**
   * @memberOf _UserMedia
   * @type {boolean}
   */
  Object.defineProperty(self, 'isActive', {
    get: function () {
      return self._isActive;
    }
  });
  /**
   * @memberOf _UserMedia
   * @param {MediaStream} stream
   * @private
   */
  self._storeStream = function(stream) {

    function setObjectEventDebug(object, prop, debugMethod) {
      object[prop] = function(event) { debug[debugMethod]('_UserMedia: mediaTrack.'+prop+': kind: '+object.kind+', event:', event); };
    }
    /**
     *
     * @param { MediaStreamTrack[] } tracks
     */
    function setTracksDebug(tracks) {
      var i, len;
      for (len=tracks.length, i=0; i<len; ++i) {
        setObjectEventDebug(tracks[i], 'onended',  'warn');
        setObjectEventDebug(tracks[i], 'onmute',   'log');
        setObjectEventDebug(tracks[i], 'onoverconstrained', 'warn');
        setObjectEventDebug(tracks[i], 'onunmute', 'log');
      }
    }

    // Store local stream
    self._stream = stream;

    // Assign event handlers to stream
    self._stream.onEnded = function() {
      debug.error('_UserMedia._storeStream(): _stream.onEnded(): that.stream:', self._stream);
      //self.stop();
    };

    // Assign event handlers to stream tracks
    setTracksDebug(stream.getTracks());
    //setTracksDebug(stream.getAudioTracks());
    //setTracksDebug(stream.getVideoTracks());
  };

  /**
   * Get information on devices used for the stream
   * @param {MediaStream} stream
   * @private
   */
  self._printStreamInfo = function(stream) {
    var msg;
    var audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      debug.info('_UserMedia._printStreamInfo(): Using Audio device: \'' + audioTracks[0].label + '\'');

      msg = '_UserMedia._printStreamInfo(): audioTracks[0].readyState is \''+audioTracks[0].readyState+'\'';
      if (audioTracks[0].readyState === 'ended') { debug.warn(msg); }
      else { debug.log(msg); }
    } else { debug.warn('_UserMedia._printStreamInfo(): stream does not contains audioTracks'); }

    var videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      debug.info('_UserMedia._printStreamInfo(): Using Video device: \'' + videoTracks[0].label + '\'');

      msg = '_UserMedia._printStreamInfo(): videoTracks[0].readyState is \''+videoTracks[0].readyState+'\'';
      if (videoTracks[0].readyState === 'ended') { debug.warn(msg); }
      else { debug.log(msg); }
    } else { debug.warn('_UserMedia._printStreamInfo(): stream does not contains videoTracks'); }
  };
  /**
   * @memberOf _UserMedia
   * @param {MediaStream} newStream
   * @private
   */
  self._getUserMediaSuccess = function(newStream) {
    debug.debug('_UserMedia._getUserMediaSuccess(): newStream:', newStream);

    self._isWaitingUser = false;
    self._isActive      = true;

    self._storeStream(newStream);

    self._printStreamInfo(newStream);

    if (self._onGetUserMediaSuccess) { self._onGetUserMediaSuccess( self._stream ); }
  };
  /**
   * @memberOf _UserMedia
   * @param error
   * @private
   */
  self._getUserMediaError = function(error) {
    debug.debug('_UserMedia._getUserMediaError():', error);

    self._isWaitingUser = false;
    self._isActive      = false;

    if (self._onGetUserMediaError) { self._onGetUserMediaError( error ); }
  };
  /**
   * @memberOf _UserMedia
   * @returns {boolean}
   */
  self.isStarted = function() {
    return !! self._stream;
  };
  /**
   * @memberOf _UserMedia
   */
  self.start = function() {};
  /**
   * Stop local media
   * @memberOf _UserMedia
   */
  self.stop = function() {
    self._isActive = false;
    if (self._stream !== null) {
      self._stream.stop();
      self._stream = null;
    }
  };

  return self;
};

/**
 *
 * @param {MediaConstraints} mediaConstraints
 * @returns {UserMedia}
 * @constructor
 */
var UserMedia = function( mediaConstraints ) {
  var self = new _UserMedia();
  //self._constraints = mediaConstraints.getValue();

//  self.isActive      = false;
//  self.isWaitingUser = false;

//  self.stream        = null;        /** Local media stream from camera and microphone **/

  /**
   *
   * @type {MediaConstraints}
   */
  self.constraints   = mediaConstraints || new MediaConstraints();

  self.audioSource = null; /** Preferred audio source **/
  self.videoSource = null; /** Preferred video source **/

  /** Event handlers **/

  self.onStart = null;
  self.onStop  = null;
  //self.onError = null;

  var super_getMediaSuccess = self._getUserMediaSuccess;
  /**
   * onGetUserMediaSuccess
   * @param {MediaStream} newStream
   */
  self._getUserMediaSuccess = function (newStream) {
//   // debug.groupCollapsed('UserMedia.start(): onGetUserMediaSuccess()');
//    debug.debug('UserMedia.start(): onGetUserMediaSuccess(): newStream:', newStream);
//
//    self._isWaitingUser = false;
//    self._isActive      = true;
//
//    /** Store local stream **/
//    self.stream = new MediaStreamView( newStream );
//
//    //window.s = self.stream;
//
//    self.stream.onEnded = function() {
//      debug.log('UserMedia.onGetUserMediaSuccess(): self.stream.onEnded(): self.stream:', self.stream);
//      self.stop();
//    };
//
    super_getMediaSuccess(newStream);

    self.stream = new MediaStreamView( self._stream );
    debug.log('UserMedia._getUserMediaSuccess(): self.stream:', self.stream);

    if (self.onGetUserMediaSuccess) { self.onGetUserMediaSuccess( self.stream ); }
    if (self.onStart) { self.onStart( self.stream ); }
    self.emit('start', self.stream);
//    //debug.groupEnd();
  };

  /**
   * Attempt to get screen was unsuccessful
   *
   * @param {object|string} error
   **/
  self.onGetUserScreenError = function (error) {
    //if (self.constraints.getScreenEnabled() || self.constraints.getDesktopEnabled()) {
    debug.error('UserMedia.onGetUserMediaError1() error: ', error);
    self._isWaitingUser = false;
    self._isActive = false;
    //if (self.onError) { self.onError(error); }
    self.emit('error', error);
    self.emit('start', null);
    //}
  };

  /**
   * Attempt to get audio & video was unsuccessful
   *
   * @param {object|string} error
   **/
  self.onGetUserVideoAudioError = function (error) {
    // Trying one more time with disabled video
    debug.warn('UserMedia.onGetUserVideoAudioError() error: ', error);
    self._startAudioOnly();
  };

  /**
   * Attempt to get audio only was also unsuccessful
   *
   * @param {object|string} error
   **/
  self.onGetUserAudioOnlyError = function (error) {
    self._isWaitingUser = false;
    self._isActive      = false;
    debug.error('UserMedia.onGetUserAudioOnlyError() error: ', error);
    //if (self.onError) { self.onError(error); }
    self.emit('error', error);
    self.emit('start', null);
  };

  self._startScreen = function() {
    self._onGetUserMediaError = self.onGetUserScreenError;
    // this statement verifies chrome extension availability
    // if installed and available then it will invoke extension API
    // otherwise it will fallback to command-line based screen capturing API
    if (DetectRTC.screen.chromeMediaSource === 'desktop') {

      if (!DetectRTC.screen.sourceId) {

        DetectRTC.screen.getSourceId(function (error) {
          // if exception occurred or access denied
          if (error && error == 'PermissionDeniedError') {
            alert('PermissionDeniedError: User denied to share content of his screen.');
          }
          self.constraints.setDesktopEnabled(DetectRTC.screen.sourceId);
          debug.log('_startScreen(): 1 self._constraints: ' + JSON.stringify(self._constraints));
          self._constraints = self.constraints.getValue();
          self._getUserMedia();
        });

      } else {
        self.constraints.setDesktopEnabled(DetectRTC.screen.sourceId);
        debug.log('_startScreen(): 2 self._constraints: ' + JSON.stringify(self._constraints));
        self._constraints = self.constraints.getValue();
        self._getUserMedia();
      }
    } else {
      self.constraints.setDesktopEnabled(DetectRTC.screen.sourceId);
      debug.log('_startScreen(): 3 self._constraints: ' + JSON.stringify(self._constraints));
      self._constraints = self.constraints.getValue();
      self._getUserMedia();
    }
  };

  self._startVideoAudio = function() {
    self._onGetUserMediaError = self.onGetUserVideoAudioError;
    if (self.audioSource) { self.constraints.setAudioSource(self.audioSource); }
    if (self.videoSource) { self.constraints.setVideoSource(self.videoSource); }
    self._constraints = self.constraints.getValue();
    debug.log('_startVideoAudio(): self._constraints: ' + JSON.stringify(self._constraints));
    self._getUserMedia();
  };

  self._startAudioOnly = function() {
    self._onGetUserMediaError = self.onGetUserAudioOnlyError;
    self.constraints.setVideoEnabled(false);
    self._constraints = self.constraints.getValue();
    debug.log('UserMedia._startAudioOnly(): self._constraints: ' + JSON.stringify(self._constraints));
    self._getUserMedia();
  };

  self.start = function() {
    //debug.groupCollapsed('UserMedia.start()');
    if ( ! isWebRTCCompatible() ) {
      debug.error('UserMedia.start(): Currently the browser you are using does not support webRTC.');
    } else {
      // Check if we still were waiting for user confirmation to access media
      if (self._isWaitingUser) {
        debug.error('UserMedia.start(): isWaitingUser:', self._isWaitingUser);
      }
      self._isWaitingUser = true;

      if ( !self._isActive ) {
        if (self.mediaType === MEDIA_TYPE.SCREEN) {
          self._startScreen();
        } else {
          self._startVideoAudio();
        }

      } else {
        //delayedRepositionAll()
        if (self.onStart) { self.onStart(); }
        self.emit('start', self.stream);
      }
    }
    //debug.groupEnd();
  };

  var super_stop = self.stop;
  self.stop = function() {
    if (self.stream) {
      self.stream.stop();
      self.stream = null;
      super_stop();

      if (self.onStop) { self.onStop(); }
      self.emit('stop');
    } else {
      super_stop();
    }
  };

  return self;
};


if (typeof module !== 'undefined') {
  module.exports  = UserMedia;
}

if (typeof window !== 'undefined') {
  window.UserMedia  = UserMedia;
}
