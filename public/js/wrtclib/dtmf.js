/**
 * Created by alykoshin on 8/26/14.
 */

"use strict";

/**
 * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#peer-to-peer-dtmf}
 */
var _RTCDTMF = function() {
  var self = this;
  Emitter(self);

  //self.reg('_tonechange');

  // Private data

  var _rtcPeerConnection = null;
  var _mediaStreamTrack  = null;

  // Protected

  /**
   * property _rtcDTMFSender
   * memberOf _RTCDTMF
   * @type {RTCDTMFSender}
   * @protected
   */
  self._rtcDTMFSender = null;

  // Event handlers

  self._ontonechange = function(tone) {
    self.emit('_tonechange', tone);
  };

  // Public properties

  self._initialize = function(rtcPeerConnection, mediaStreamTrack) {
//    try {
    if (mediaStreamTrack && rtcPeerConnection.createDTMFSender) {
//    assert(rtcPeerConnection && rtcPeerConnection.createDTMFSender && mediaStreamTrack, '_RTCDTMF._init(): Invalid parameters');

      _rtcPeerConnection = rtcPeerConnection;
      _mediaStreamTrack  = mediaStreamTrack;

      self._rtcDTMFSender = rtcPeerConnection.createDTMFSender(mediaStreamTrack);
      debug.log('_RTCDTMF(): rtcDTMFSender:', self.rtcDTMFSender);

      self._rtcDTMFSender.ontonechange = self._ontonechange;
    } else {
      self._rtcDTMFSender = null;
      debug.warn('BasicDTMF.sendDTMF(): unable to create rtcDTMFSender');
    }
//    } catch(e) {
//      debug.error('_initialize(): ', e);
//    }
  };

  self._terminate = function() {
    self._rtcDTMFSender = null;
  };

  self._insertDTMF = function(tones, duration, interToneGap) {
    if (self._rtcDTMFSender) {
      debug.debug('_RTCDTMF.sendDTMF(): tones:', tones);
      self._rtcDTMFSender.insertDTMF(tones, duration, interToneGap);
    } else {
      debug.warn('_RTCDTMF.sendDTMF(): _rtcDTMFSender not assigned:', self._rtcDTMFSender);
    }
  };

  // Debugging

  self.on('_tonechange', function(tone) { debug.log('_RTCDTMF.on(): _tonechange', tone); } );

  return self;
};

//var _RTCDTMF = function() {
//  var self = new _RTCDTMF();
//
//  // Low level Events
//
//  var ontonechange = null;
//
//  // Low level Event Handlers
//
//  var _ontonechange = function(tone) {
//    debug.debug('_RTCDTMF(): _rtcDTMFSender.ontonechange(): tone:', tone.tone);
//    if (ontonechange) {
//      /**
//       * @fires BasicDTMF#onToneChange
//       */
//      ontonechange(tone.tone);
//    }
//  };
//
//  // Low Level Methods
//
//  self._initialize = function (rtcPeerConnection, mediaStreamTrack) {
//    if (mediaStreamTrack && rtcPeerConnection.createDTMFSender) {
////    assert(rtcPeerConnection && rtcPeerConnection.createDTMFSender && mediaStreamTrack, '_RTCDTMF._init(): Invalid parameters');
//
//      self._rtcPeerConnection = rtcPeerConnection;
//      self._mediaStreamTrack  = mediaStreamTrack;
//      //_rtcDTMFSender = rtcPeerConnection.createDTMFSender(mediaStreamTrack);
//      self._initialize(rtcPeerConnection, mediaStreamTrack);
//      debug.log('_RTCDTMF(): rtcDTMFSender:', self.rtcDTMFSender);
//
//      self._rtcDTMFSender.ontonechange = _ontonechange;
//    } else {
//      self._rtcDTMFSender = null;
//      debug.warn('BasicDTMF.sendDTMF(): unable to create rtcDTMFSender');
//    }
//  };
//
//  self._insertDTMF = function (tones, duration, interToneGap) {
//    if (self._rtcDTMFSender) {
////    assert(self._rtcDTMFSender, '_RTCDTMF._insertDTMF(): rtcDTMFSender is not assigned');
////    if (_rtcDTMFSender) {
//      debug.debug('_RTCDTMF.sendDTMF(): tones:', tones);
//      self._rtcDTMFSender.insertDTMF(tones, duration, interToneGap);
////    } else {
////      debug.warn('BasicConnection.sendDTMF(): rtcDTMFSender not assigned:', rtcDTMFSender);
////    }
//    } else {
//      debug.warn('_RTCDTMF.sendDTMF(): _rtcDTMFSender not assigned:', self._rtcDTMFSender);
//    }
//  };
//
//  return self;
//};

/**
 *
 * @class BasicDTMF
 * @constructor
 * @param {RTCPeerConnection} rtcPeerConnection
 * @param {MediaStreamTrack}  [mediaStreamTrack] - If not set, first audioTrack of first remote mediaStream of rtcPeerConnection will be used
 */

var BasicDTMF = function(rtcPeerConnection, mediaStreamTrack) {

  /**
   * Find first available audio audioTrack
   *
   * @param {RTCPeerConnection} rtcPeerConnection
   * @private
   */
  function getFirstTrack(rtcPeerConnection) {
    /**
     * @type {MediaStreamTrack}
     */
    var audioTrack;
    /**
     * @type {MediaStream[]}
     */
    var localStreams = rtcPeerConnection.getLocalStreams();
    if (localStreams.length > 0) {
      /**
       * @type {MediaStream}
       */
      var localStream = localStreams[0];
      /**
       * @type {MediaStreamTrack[]}
       */
      var audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTrack = audioTracks[0];
      } else {
        debug.warn('BasicDTMF(): mediaStreamTrack not set and no audioTracks available');
        audioTrack = null;
      }
    } else {
      debug.warn('BasicDTMF(): mediaStreamTrack not set and no localStreams available');
      audioTrack = null;
    }
    return audioTrack;
  }

  var self = new _RTCDTMF();

  /**
   * @typedef {function} OnToneChange
   * @memberOf BasicDTMF
   * @param {string} tone
   */

  /**
   * @type {OnToneChange}
   * @private
   */
  var onToneChange;

  /**
   * @event onToneChange
   * @type OnToneChange
   * @memberOf BasicDTMF
   */
  Object.defineProperty(this, "onToneChange", {
    get: function () {
      return onToneChange;
    },
    set: function (val) {
      onToneChange = val;
    }
  });
  /**
   * @property rtcDTMFSender
   * @type {RTCDTMFSender}
   */
  Object.defineProperty(this, "rtcDTMFSender", {
    get: function () { return self._rtcDTMFSender; }
  });

  /** if not set, try to use first audioTrack of first remote stream **/
  if ( ! mediaStreamTrack ) {
    mediaStreamTrack = getFirstTrack(rtcPeerConnection);
  }

//  if (mediaStreamTrack && rtcPeerConnection.createDTMFSender) {
  self._initialize(rtcPeerConnection, mediaStreamTrack);
//    rtcDTMFSender = rtcPeerConnection.createDTMFSender(mediaStreamTrack);
//    debug.log('BasicDTMF(): rtcDTMFSender:', rtcDTMFSender);

//    /**
//     *
//     * @type RTCDTMFSender#ontonechange
//     * @param {RTCDTMFToneChangeEvent} tone
//     */
//    rtcDTMFSender.ontonechange = function (tone) {
//      debug.debug('rtcDTMFSender.ontonechange(): tone:', tone.tone);
//      if (onToneChange) {
//        /**
//         * @fires BasicDTMF#onToneChange
//         */
//        onToneChange(tone.tone);
//      }
//    };

  /**
   * @method send
   * @memberOf BasicDTMF
   * @param {DOMString} tones        - The tones parameter is treated as a series of characters. The characters 0 through 9,
   *                                   A through D, #, and * generate the associated DTMF tones. The characters a to d are
   *                                   equivalent to A to D. The character ',' indicates a delay of 2 seconds before
   *                                   processing the next character in the tones parameter. All other characters must be
   *                                   considered unrecognized.
   * @param {long} [duration=100]    - The duration parameter indicates the duration in ms to use for each character passed
   *                                   in the tones parameters. The duration cannot be more than 6000 ms or less than 40 ms.
   *                                   The default duration is 100 ms for each tone.
   * @param {long} [interToneGap=70] - The interToneGap parameter indicates the gap between tones. It must be at least 30 ms.
   *                                   The default value is 70 ms. The browser may increase the duration and interToneGap
   *                                   times to cause the times self DTMF start and stop to align with the boundaries of RTP
   *                                   packets but it must not increase either of them by more than the duration of a single
   *                                   RTP audio packet.
   */
  var send = function (tones, duration, interToneGap) {
//      if (self._rtcDTMFSender) {
    self._insertDTMF(tones, duration, interToneGap);
//        debug.debug('BasicConnection.sendDTMF(): tones:', tones);
//        rtcDTMFSender.insertDTMF(tones, duration, interToneGap);
//      } else {
//        debug.warn('BasicDTMF.sendDTMF(): _rtcDTMFSender not assigned:', self._rtcDTMFSender);
//      }
  };
  self.send = send;

  self.on('_tonechange', function(tone) {
    /**
     * @fires BasicDTMF#onToneChange
     */
    if (onToneChange) { onToneChange(tone.tone); }
  })
//  } else {
//    self._rtcDTMFSender = null;
//    debug.warn('BasicDTMF.sendDTMF(): unable to create rtcDTMFSender');
//  }

  return self;
};
