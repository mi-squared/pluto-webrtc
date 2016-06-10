/**
 * Created by alykoshin on 7/18/14.
 */

'use strict';


/**
 * @callback onEnded
 *
 */
/**
 * @callback onAddTrack
 *
 */
/**
 * @callback onRemoveTrack
 *
 */

/**
 *
 * @constructor
 * @param {MediaStream} stream
 * @returns {MediaStreamController}
 */
var MediaStreamController = function( stream ) {
  var that = {};

  /** Private properties **/

  /** Public properties **/

  /**
   * @memberOf MediaStreamController
   * @type {MediaStream}
   */
  that.stream = stream;

  /**
   * @type {onEnded}
   */
  that.onEnded       = null;
  /**
   * @type {onAddTrack}
   */
  that.onAddTrack    = null;
  /**
   *  @type {onRemoveTrack}
   */
  that.onRemoveTrack = null;

  that.muted        = false;
  that.videoEnabled = true;
  that.audioEnabled = true;

  /** Stream event handlers **/

  that.stream.onended = function() {
    debug.log('MediaStreamController.stream.onended()');
    if (that.onEnded) { that.onEnded.call(); }
  };

  that.stream.onaddtrack = function() {
    debug.log('MediaStreamController.stream.onaddtrack()');
    if (that.onAddTrack) { that.onAddTrack.call(); }
  };

  that.stream.onremovetrack = function() {
    debug.log('MediaStreamController.stream.onremovetrack()');
    if (that.onRemoveTrack) { that.onRemoveTrack.call(); }
  };

  /** Public methods - Stream control **/

  that.stop = function() {
    debug.log('MediaStreamController.stop()');
    stream.stop();
  };

  that.hasAudio = function() {
    return that.stream.getAudioTracks().length > 0;
  };

  that.setAudioEnabled = function(value) {
    debug.debug('MediaStreamController.setAudioEnabled('+value+')');
    that.audioEnabled = value;
    var audioTracks = that.stream.getAudioTracks();
    for ( var i = 0, l = audioTracks.length; i < l; i++ ) {
      audioTracks[i].enabled = value;
    }
  };

  that.toggleAudioEnabled = function() {
    debug.debug('MediaStreamController.toggleAudioEnabled()');
    // that.audioEnabled = ! that.audioEnabled;
    that.setAudioEnabled( ! that.audioEnabled );
//    var audioTracks = that.stream.getAudioTracks();
//    for ( var i=0, l = audioTracks.length; i<l; i++ ) {
//      audioTracks[i].enabled = ! audioTracks[i].enabled;
//    }
  };

  that.hasVideo = function() {
    return that.stream.getVideoTracks().length > 0;
  };

  that.setVideoEnabled = function(value) {
    /** Muting for screencast is disabled
     * https://code.google.com/p/chromium/codesearch#chromium/src/third_party/libjingle/source/talk/media/webrtc/webrtcvideoengine.cc&q=Disable%20muting%20for%20screencast.&sq=package:chromium&type=cs&l=3232
     **/
    debug.debug('MediaStreamController.setVideoEnabled('+value+')');
    that.videoEnabled = value;
    var tracks = that.stream.getVideoTracks();
    for ( var i = 0, l = tracks.length; i < l; i++ ) {
      tracks[i].enabled = value;
    }
  };

  that.toggleVideoEnabled = function() {
    /** Muting for screencast is disabled
     * https://code.google.com/p/chromium/codesearch#chromium/src/third_party/libjingle/source/talk/media/webrtc/webrtcvideoengine.cc&q=Disable%20muting%20for%20screencast.&sq=package:chromium&type=cs&l=3232
     **/
    debug.debug('MediaStreamController.toggleVideoEnabled()');
//    var tracks = that.stream.getVideoTracks();
//    for ( var i=0, l=tracks.length; i<l; i++ ) {
//      tracks[i].enabled = ! tracks[i].enabled;
//    }
    //that.videoEnabled = ! that.videoEnabled;
    that.setVideoEnabled( ! that.videoEnabled );

  };

  that.setAudioEnabled(that.audioEnabled);

  that.setVideoEnabled(that.videoEnabled);

  return that;
};


