/**
 * Created by alykoshin on 9/9/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var Emitter = require('./../../mylib/emitter.js');
}

/**
 * Low-level wrapper for RTCPeerConnection
 *
 * @class __RTCPeerConnection
 * @constructor
 * @returns {__RTCPeerConnection}
 * private
 */

var __RTCPeerConnection = function() {
  var self = new WRTCObject();
  Emitter(self);

  /**
   * @name rtcPeerConnection
   * @memberOf __RTCPeerConnection
   * @type {RTCPeerConnection}
   * private
   */
  var rtcPeerConnection = null;

  /**
   * @name rtcPeerConnection
   * @memberOf __RTCPeerConnection
   * @type {RTCPeerConnection}
   * @readOnly
   */
  Object.defineProperty(self, 'rtcPeerConnection', {
    get: function () {
      return rtcPeerConnection;
    }
  });

  /**
   * @name signalingState
   * @memberOf __RTCPeerConnection
   * @type {RTCSignalingState}
   * @readOnly
   */
  Object.defineProperty(self, 'signalingState', {
    /** @returns {RTCSignalingState} */
    get:
      function () {
        return rtcPeerConnection ? rtcPeerConnection.signalingState : null;
      }
  });

  /**
   * @name iceConnectionState
   * @memberOf __RTCPeerConnection
   * @type {RTCIceConnectionState}
   * @readOnly
   */
  Object.defineProperty(self, 'iceConnectionState', {
    /** @returns {RTCIceConnectionState} */
    get: function () {
      return rtcPeerConnection ? rtcPeerConnection.iceConnectionState : null;
    }
  });

  /**
   * @name iceConnectionState
   * @memberOf __RTCPeerConnection
   * @type {RTCIceGatheringState}
   * @readOnly
   */
  Object.defineProperty(self, 'iceGatheringState', {
    /** @returns {RTCIceGatheringState} */
    get: function () {
      return rtcPeerConnection ? rtcPeerConnection.iceGatheringState : null;
    }
  });

  /**
   *
   * @param rtcConfiguration
   */
  self._createPeerConnection = function(rtcConfiguration) {

    // Create the WebRTC object RTCConnection

    debug.log('__RTCPeerConnection._createPeerConnection(): rtcConfiguration:' + JSON.stringify(rtcConfiguration, null, 2));
    rtcPeerConnection = new RTCPeerConnection(rtcConfiguration);

    // Set RTCConnection events

    /**
     * @type RTCPeerConnection#onaddstream
     * @fires _addstream
     */
    rtcPeerConnection.onaddstream = function(ev) {
      self.emit('_addstream',    ev);
    };

    /**
     * @type RTCPeerConnection#ondatachannel
     * @fires _datachannel
     */
    rtcPeerConnection.ondatachannel = function(ev) {
      self.emit('_datachannel',  ev);
    };

    /**
     * @type RTCPeerConnection#onicecandidate
     * @fires _icecandidate
     */
    rtcPeerConnection.onicecandidate = function(ev) {
      self.emit('_icecandidate', ev);
    };

    /**
     * @type RTCPeerConnection#oniceconnectionstatechange
     * @fires _iceconnectionstatechange
     */
    rtcPeerConnection.oniceconnectionstatechange = function(ev) {
      // It's better not to access self object as during destruction it may be already null
      debug.log('rtcPeerConnection.oniceconnectionstatechange()' +
        '; iceConnectionState:', ev.target.iceConnectionState,
        '; iceGatheringState:',  ev.target.iceGatheringState,
        '; ev:', ev);
      self.emit('_iceconnectionstatechange', ev);
    };

    /**
     * @type RTCPeerConnection#onnegotiationneeded
     * @fires _negotiationneeded
     */
    rtcPeerConnection.onnegotiationneeded = function(ev) {
      self.emit('_negotiationneeded', ev);
    };

    /**
     * @type RTCPeerConnection#onremovestream
     * @fires _removestream
     */
    rtcPeerConnection.onremovestream = function(ev) {
      self.emit('_removestream', ev);
    };

    /**
     * @type RTCPeerConnection#onsignalingstatechange
     * @fires _signalingstatechange
     */
    rtcPeerConnection.onsignalingstatechange = function(ev) {
      // It's better not to access self object as during destruction it may be already null
      debug.log('rtcPeerConnection.onsignalingstatechange()' +
        ': signalingState:', ev.target.signalingState,
        '; ev:', ev);
      self.emit('_signalingstatechange', ev);
    };

  };

  /**
   * Cleanup - close rtcPeerConnection and set it to null
   *
   * @memberOf _RTCPeerConnection
   */

  self.cleanup = function() {
    debug.log('_RTCPeerConnection.cleanup()');
    self.emit('close', self);
    rtcPeerConnection.close();  // Close connection RTCPeerConnection
    rtcPeerConnection = null;   // Remove reference to it
  };

  /**
   *
   * @param localDescription
   * @private
   */
  self._createOfferSuccess = function(localDescription) {
    //debug.log('__RTCPeerConnection._createOfferSuccess: localDescription:', localDescription);
    self.emit('_createOfferSuccess', localDescription);
  };

  /**
   *
   * @param error
   * @private
   */
  self._createOfferError = function(error) {
    //debug.log('__RTCPeerConnection._createOfferError: error:', error);
    self.emit('_createOfferError',   error);
  };

  /**
   *
   * @param {RTCOfferConstraints} constraints
   * @fires _offerSuccess
   * @fires _offerError
   */
  self._createOffer = function(constraints) {
    self.emit('_createOffer', constraints);
    rtcPeerConnection.createOffer( self._createOfferSuccess, self._createOfferError, constraints);
  };

  /**
   *
   * @param localDescription
   * @fires _createAnswerSuccess
   * @private
   */
  self._createAnswerSuccess = function(localDescription) {
    self.emit('_createAnswerSuccess', localDescription);
  };

  /**
   *
   * @param error
   * @fires _createAnswerError
   * @private
   */
  self._createAnswerError = function(error) {
    self.emit('_createAnswerError', error);
  };

  /**
   *
   * @param {RTCOfferConstraints} constraints
   * @fires _answerSuccess
   * @fires _answerError
   */
  self._createAnswer = function(constraints) {
    self.emit('_createAnswer', constraints);
    rtcPeerConnection.createAnswer( self._createAnswerSuccess, self._createAnswerError, constraints);
  };

  /**
   * @method _addLocalStream
   * @memberOf __RTCPeerConnection
   * @param {MediaStream} stream
   * @fires _addLocalStream - BEFORE calling RTCPeerConnection.addStream
   */
  self._addLocalStream = function (stream) {
    self.emit('_addLocalStream', stream);
    rtcPeerConnection.addStream( stream );
  };
  self.on('_addLocalStream',  function(ev) { debug.log('__RTCPeerConnection._addLocalStream(): ev:', ev); } );

  /**
   * @memberOf __RTCPeerConnection
   * @param {RTCSessionDescription} localDescription
   * @fires _setLocalDescription - BEFORE calling RTCPeerConnection.setLocalDescription
   */
  self._setLocalDescription = function(localDescription) {
    self.emit('_setLocalDescription', localDescription);
    self.rtcPeerConnection.setLocalDescription(localDescription);
  };
  self.on('_setLocalDescription',  function(ev) { debug.log('__RTCPeerConnection.on(): _setLocalDescription(): ev:', ev); } );

  /**
   * @memberOf __RTCPeerConnection
   * @param {RTCSessionDescription} remoteDescription
   * @fires _setRemoteDescription - BEFORE calling RTCPeerConnection.setRemoteDescription
   */
  self._setRemoteDescription = function(remoteDescription) {
    self.emit('_setRemoteDescription', remoteDescription);
    self.rtcPeerConnection.setRemoteDescription( new RTCSessionDescription(remoteDescription) );
  };

  return self;
};


var _RTCPeerConnection = function ( rtcConfiguration ) {
  var self = new __RTCPeerConnection();
  self._createPeerConnection(rtcConfiguration);

  /*
   * 4.2.4 Offer/Answer Options
   * These dictionaries describe the options that can be used to control the offer/answer creation process.
   * dictionary RTCOfferOptions {
   *  long    offerToReceiveVideo;
   *  long    offerToReceiveAudio;
   *  boolean voiceActivityDetection = true;
   *  boolean iceRestart = false;
   * };
   */

  /* Answer/Offer Constraints
   * More info: http://dev.w3.org/2011/webrtc/editor/webrtc.html#idl-def-RTCOfferOptions
   */
    // Can be left empty - session is still ok (at least two-way video)
  /**
   * @type {RTCOfferConstraints}
   */
  self.OFFER_ANSWER_CONSTRAINTS = {
    mandatory: {
      OfferToReceiveVideo: true,
      OfferToReceiveAudio: true
    }
  };
  /**
   * @type {RTCOfferConstraints}
   */
  self.offerConstraints  = _.clone(self.OFFER_ANSWER_CONSTRAINTS);
  /**
   * @type {RTCOfferConstraints}
   */
  self.answerConstraints = _.clone(self.OFFER_ANSWER_CONSTRAINTS);

  /**
   * Create offer
   *
   * @memberOf _RTCPeerConnection
   */
  self.createOffer = function() {
    self._createOffer(self.offerConstraints);
  };

  /**
   * Create answer
   *
   * @memberOf _RTCPeerConnection
   */
  self.createAnswer = function() {
    self._createAnswer( self.answerConstraints );
  };

  /**
   * @method addLocalStream
   * @memberOf _RTCPeerConnection
   * @param {MediaStreamController} mediaStream
   */
  self.addLocalStream = function (mediaStream) {
    self._addLocalStream( mediaStream.stream );
  };

  return self;
};


if (typeof module !== 'undefined') {
  //module.exports = __RTCPeerConnection;
  module.exports = _RTCPeerConnection;
}

if (typeof window !== 'undefined') {
  window._RTCPeerConnection  = _RTCPeerConnection;
}
