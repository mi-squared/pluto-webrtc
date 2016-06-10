/**
 * Created by alykoshin on 7/16/14.
 */
'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var WRTCPeerConnection   = require('./wrtcPeerConnection.js');
}

/**
 * Wrapper for RTCPeerConnection
 *
 * @class BasicConnection
 * @param {{
 *   rtcConfiguration: {},
 *   audio_send_codec: String,
 *   audio_receive_codec: String,
 *   STEREO: {boolean},
 *   bandwidth: {string},
 *   BANDWIDTH_VOICE_LOW: number,
 *   BANDWIDTH_VIDEO_LOW: number
 * }} options
 * @returns {WRTCPeerConnection}
 * @constructor
 */

var BasicConnection = function ( options ) {

  var DEFAULT_RTC_CONFIG = { iceServers: [
    // { "url": "stun:stun.stunprotocol.org:3478" }
    { "url": "stun:stun.l.google.com:19302" }
    // { "url": "turn:demo@wrtc.ru", "credential": "testing" }
    // { "url": "turn:demo@wrtc.ru", "credential": "testing" }
  ] };

  /**
   * RTCConfiguration
   * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#idl-def-RTCConfiguration}
   *
   * Default STUN и TURN-servers
   * To be overrided from server by 'config' message
   *
   * @memberOf BasicConnection
   * @type {{iceServers: object[]}}
   */
  options.rtcConfiguration = options.rtcConfiguration || DEFAULT_RTC_CONFIG;


  /** Constants to be used in SDP modifications **/
  options.STEREO              = options.STEREO              || false;
  options.audio_send_codec    = options.audio_send_codec    || '';
  options.audio_receive_codec = options.audio_receive_codec || 'opus/48000';

  /** High or low bandwidth **/
  options.bandwidth            = options.bandwidth          || BANDWIDTH.HIGH;

  /** Audio/video bandwidth values for low bandwidth **/
  options.BANDWIDTH_VOICE_LOW = options.BANDWIDTH_VOICE_LOW ||  8;
  options.BANDWIDTH_VIDEO_LOW = options.BANDWIDTH_VIDEO_LOW || 30;

  /** All events **/
//  options.onCreateOfferSuccess             = options.onCreateOfferSuccess             || null;
//  options.onCreateOfferError               = options.onCreateOfferError               || null;
//  options.onCreateAnswerSuccess            = options.onCreateAnswerSuccess            || null;
//  options.onCreateAnswerError              = options.onCreateAnswerError              || null;

//  options.onAddStream                = options.onAddStream                || null;
//  options.onDataChannel              = options.onDataChannel              || null;
//  options.onIceCandidate             = options.onIceCandidate             || null;
//  options.onIceConnectionStateChange = options.onIceConnectionStateChange || null;
//  options.onNegotiationNeeded        = options.onNegotiationNeeded        || null;
  //options.onRemoveStream             = options.onRemoveStream             || null;
//  options.onSignallingStateChange    = options.onSignallingStateChange    || null;

  var self = new WRTCPeerConnection(options);

  /**
   * @memberOf BasicConnection
   * @property {BasicDTMF} dtmfSender
   */
  self.dtmfSender = null;


  self.addIceBuffer = function (iceBuffer, connId) {
    //debug.groupCollapsed('Connection.addIceBuffer()');
    /** Check if some Ice Candidates with this connId were buffered **/
    debug.log('Connection.addIceBuffer(): Buffered Ice Candidates count:', iceBuffer.count() );

    for (var i = 0; i < iceBuffer.count(); i++) {
      var buffered = iceBuffer.getByIndex(i);

      if (buffered.connId === connId) {
        debug.warn('Connection.addIceBuffer(): Adding buffered Ice Candidate:', buffered.ice,
          '; connId:', connId);
        self.addIceCandidate(buffered.ice);
      }
    }
    iceBuffer.removeForConn(connId);
    //debug.groupEnd();
    return iceBuffer;
  };

  /**
   * @method addIceCandidate
   * @memberOf BasicConnection
   * @param {RTCIceCandidate} cand
   */
  self.addIceCandidate = function(cand) {
    debug.groupCollapsed('BasicConnection.addIceCandidate()');
    // Example of cand:
    //  RTCIceCandidate { sdpMLineIndex: 0, sdpMid: "audio", candidate: "a=candidate:599991555 1 udp 2122260223 192.168.1.32 44869 typ host generation 0 ↵" }
    //
    var candidateString = cand.candidate;
    var parsed = parseIceCandidate( candidateString );
//    if ( (parsed.type === ICE_TYPE.RELAY && CONFIG.TURN.DEBUG.CANDIDATES.TURN    ) ||
//         (parsed.type !== ICE_TYPE.RELAY && CONFIG.TURN.DEBUG.CANDIDATES.NON_TURN) ) {
    if ( CONFIG.TURN.DEBUG.BLOCK.indexOf(parsed.type) < 0 ) { /** Not contains in the list to block for the tests **/
      debug.log('BasicConnection.addIceCandidate(): adding candidateType:\'' + parsed.type + '\'; candidateString:' + candidateString);
      // Adding the candidate which was received from remote side to local RTCPeerConnection

      self.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(cand));

    } else {
      debug.warn('BasicConnection.addIceCandidate(): skipping candidateType:', parsed.type);
    }
    debug.groupEnd();
  };

  self.setLDesc = self._setLocalDescription;
  self.setRDesc = self._setRemoteDescription;

  return self;
};




/**
 * ...
 *
 * @class Connection
 * @param options
 * @returns {{}}
 * @constructor
 */

var Connection = function( options ) {

  var self;

  var onAddStream = function (mediaStream) {
    if (self.rvid) {                    /** If this peerConnection have remote video element **/
      debug.log('Connection.onAddStream(): mediaStream:', mediaStream, '; self.rvid:', self.rvid);
      self.rvid.attach( mediaStream );  /** then attach the stream to it **/
      /** No need to call attachingTo() as it is called inside rvid.attach() **/
      // mediaStream.attachingTo( self.rvid );
    }
//    if (options.onAddStream) { options.onAddStream(mediaStream); }
  };


  self = new BasicConnection( options );




  self.onAddStream = onAddStream;

  self.lvid = null; /** Local  Vid (Vid = Container+Video+Overlay+Controls) **/
  self.rvid = null; /** Remote Vid (Vid = Container+Video+Overlay+Controls) **/

  self.wrtcStats = new WrtcStats(self); /** attach statistics calculation   **/
  self.wrtcStats.onThreshold = function(thlds) {
    if (self.rvid) {
      self.rvid.setQos( thlds.length > 0 );
    }
  };

  self.mediaType = options.mediaType;
  self.connId    = options.connId;



  var inherited_cleanup = self.cleanup;
  self.cleanup = function() {
    inherited_cleanup();

    /** Currently we control the removal 'lvid' during hangup,
     * so to remove 'lvid' here is an error
     * 'rvid' can be removed here,
     * however, there is no need as it is already removed **/
    if (self.lvid) { /* self.lvid.cleanup(); */ self.lvid = null; }
    if (self.rvid) { /* self.rvid.cleanup(); */ self.rvid = null; }
    self.wrtcStats.stop();
    self.wrtcStats = null;
  };

  self.showText = function ( text ) {
    debug.log('Connection.showText()');
 //   if ( remoteUsername ) {
    var vid = self.rvid;
      debug.log('Connection.showText(): vid:', vid);
      if ( vid ) { // For Screen and Video2 there is one-way video, so there is no remote video exists
        vid.setText( text );// + ' [' + remoteUser.id + ':' + connId + ']' );
      }
//    }
  };

  var REMOTE_SHOW_IDS = false;

  self.showUserInfo = function() {
    var text = self.remoteUser.name;
    if (REMOTE_SHOW_IDS) {
      text += ' [' + self.remoteUser.id + ':' + self.connId + ']';
    }
    self.showText(text);
  };

  return self;
};

if (typeof module !== 'undefined') {
  module.exports = Connection;
}

if (typeof window !== 'undefined') {
  window.Connection  = Connection;
}
