/**
 * Created by alykoshin on 9/3/14.
 */

"use strict";

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var _RTCPeerConnection = require('./_RTCPeerConnection.js');
}

/**
 * Medium-level wrapper for RTCPeerConnection
 *
 * @class LWRTCPeerConnection
 * @constructor
 * @param {{}} rtcConfiguration
 */
var LWRTCPeerConnection = function ( rtcConfiguration ) {

  /**
   * @type {LWRTCPeerConnection}
   * @private
   */
  var self = new _RTCPeerConnection(rtcConfiguration);

  /**
   * @memberOf LWRTCPeerConnection
   * @type {BasicDTMF}
   */
  self.dtmfSender = null;

  self.onAddStream                = null;
//  self.onDataChannel              = null;
  self.onIceCandidate             = null;
//  self.onIceConnectionStateChange = null;
  //self.onNegotiationNeeded        = null;
  ///self.onRemoveStream             = null;
  self.onSignalingStateChange    = null;

  /** RTCPeerConnection event handling **/

  self.on('_addstream', function(ev) {
    var mediaStream = new MediaStreamView( ev.stream );
    self.dtmfSender = new BasicDTMF(self.rtcPeerConnection);
    if ( self.onAddStream ) { self.onAddStream(mediaStream); }
  });

  //self.on('_datachannel', function(ev) {
  //  if (ev) {
  //    debug.log('LWRTCPeerConnection.ondatachannel():', ev);
  //    //if ( self.onDataChannel ) { self.onDataChannel(); }
  //  }
  //});

  self.on('_icecandidate', function(ev) {
    /**
     * Fix for Temasys 0.8.794 bug
     * More details: https://groups.google.com/d/msg/temasys-discuss-webrtcplugin/jgUatfO1pDA/n1beMrml9AIJ
     *
     * @param {RTCIceCandidate} origCand
     * @returns {RTCIceCandidate}
     */
    function FixTemasys_0_8_794 (origCand) {
      var resultCand;
      if (origCand) {
        resultCand = {
          candidate:     origCand.candidate,
          sdpMid:        origCand.sdpMid,
          sdpMLineIndex: origCand.sdpMLineIndex
        };
      } else {
        resultCand = null;
      }
      return resultCand;
    }

    /**
     *
     * @type {RTCIceCandidate}
     */
    var cand = ev.candidate;
    //
    // Example of cand:
    //  RTCIceCandidate { sdpMLineIndex: 0, sdpMid: "audio", candidate: "a=candidate:599991555 1 udp 2122260223 192.168.1.32 44869 typ host generation 0 ↵" }
    //
    cand = FixTemasys_0_8_794( cand );

    if (cand) {
      debug.log('LWRTCPeerConnection.onicecandidate(): ev.candidate.candidate: "'+
        cand.candidate.replace('\r\n', '') + '"', cand);
      if ( self.onIceCandidate ) { self.onIceCandidate(cand); }
    }
  });

  /**
   * @param ev
   */
  self.on('_iceconnectionstatechange', function(ev) {
    // ev.target is undefined in IE10+Temasys
    if (self.rtcPeerConnection) { // On IE with Temasys we can get situation when event fires, however, that or that.pc is already not exists
      debug.log('pc.on(\'_iceconnectionstatechange\'):',
        '; iceConnectionState:', ev.target.iceConnectionState,
        '; iceGatheringState:',  ev.target.iceGatheringState);
    }
    //if ( self.onIceConnectionStateChange ) {
    //  self.onIceConnectionStateChange(self.iceConnectionState, self.iceGatheringState);
    //}
    self.emit('iceConnectionStateChange', ev.target.iceConnectionState, ev.target.iceGatheringState);
  });

  //self.on('_negotiationneeded', function(ev) {
  //  if (self.onNegotiationNeeded ) { self.onNegotiationNeeded(ev); }
  //});

  //self.on('_removestream', function(ev) {
  //  if ( self.onRemoveStream ) { self.onRemoveStream(ev); }
  //});

  self.on('_signalingstatechange', function(ev) {
    // ev.target is undefined in IE10+Temasys
    if (/*self &&*/ self.rtcPeerConnection) { /** On IE with Temasys we can get situation when event fires, however, that.pc is already not exists **/
    debug.log('pc.signalingstatechange():',
      'signalingSate:', ev.target.signalingState,
      '; ev.target:', ev.target);
    }

    if ( self.onSignalingStateChange ) { self.onSignalingStateChange(ev.target.signalingState); }
    self.emit('signalingStateChange', ev.target.signalingState);
  });

  return self;

};

if (typeof module !== 'undefined') {
  module.exports = LWRTCPeerConnection;
}

if (typeof window !== 'undefined') {
  window.LWRTCPeerConnection = LWRTCPeerConnection;
}
