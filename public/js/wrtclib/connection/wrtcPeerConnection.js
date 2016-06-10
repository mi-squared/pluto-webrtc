/**
 * Created by alykoshin on 9/3/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var LWRTCPeerConnection = require('./lwrtcPeerConnection.js');
}

/**
 * Wrapper for RTCPeerConnection
 *
 * @class WRTCPeerConnection
 * @constructor
 * @param {{
 *   rtcConfiguration: {},
 *   audio_send_codec: String,
 *   audio_receive_codec: String,
 *   STEREO: {boolean},
 *   bandwidth: {string},
 *   BANDWIDTH_VOICE_LOW: number,
 *   BANDWIDTH_VIDEO_LOW: number
 * }} options
 */
var WRTCPeerConnection = function ( options ) {

  /**
   * @type {WRTCPeerConnection}
   * @private
   */
  var self = LWRTCPeerConnection(options.rtcConfiguration);

  /**
   * @memberOf WRTCPeerConnection
   * @type {function}
   */
  self.onIceCandidate = null;

  function preprocessDescription(description) {
    var sdp = description.sdp;
    if (options.STEREO) {
      sdp = addStereo(sdp);
    }


    // options.audio_send_codec = 'PCMA/8000';


    if (options.audio_send_codec) {
      sdp = preferAudioCodec(sdp, options.audio_send_codec);
    }
    sdp = sdp_sendonly2sednrecv(sdp);
    sdp = sdp_recvonly2sednrecv(sdp);
    if (options.bandwidth === BANDWIDTH.LOW) {
      sdp = setBandwidth(sdp, options.BANDWIDTH_VOICE_LOW, options.BANDWIDTH_VIDEO_LOW);
    }
    description.sdp = sdp;
    return description;
  }

  self.on('_setLocalDescription',  preprocessDescription);
  self.on('_setRemoteDescription', preprocessDescription);

  /**
   * @memberOf WRTCPeerConnection
   * @param {RTCSessionDescription} localDescription
   * @private
   */
  self.on('_createOfferSuccess', function(localDescription) {
    self._setLocalDescription(localDescription);
    self.addIceBuffer(iceBuffer);
    if (self.onCreateOfferSuccess) { self.onCreateOfferSuccess(localDescription); }
  });

  /**
   * @memberOf WRTCPeerConnection
   * @param error
   * @private
   */
  self.on('_createOfferError', function(error) {
    debug.error('WRTCPeerConnection.createOffer(): _onOfferError(): ' + errorToString(error));
    if (self.onOfferError) { self.onOfferError(error); }
  });

  /**
   * @memberOf WRTCPeerConnection
   * @param localDescription
   * @private
   */
  self.on('_createAnswerSuccess', function(localDescription) {
    self._setLocalDescription(localDescription);
    self.addIceBuffer(iceBuffer);
    if (self.onCreateAnswerSuccess) { self.onCreateAnswerSuccess(localDescription); }
  });

  /**
   * @memberOf WRTCPeerConnection
   * @param error
   * @private
   */
  self.on('_createAnswerError', function(error) {
    debug.error('WRTCPeerConnection.createAnswer(): onAnswerError(): ' + errorToString(error));
    if (self.onCreateAnswerError) { self.onCreateAnswerError(error); }
  });

  return self;

};

if (typeof module !== 'undefined') {
  module.exports = WRTCPeerConnection;
}

if (typeof window !== 'undefined') {
  window.WRTCPeerConnection = WRTCPeerConnection;
}
