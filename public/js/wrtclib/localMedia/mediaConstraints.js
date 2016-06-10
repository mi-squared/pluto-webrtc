/**
 * Created by alykoshin on 7/18/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {

}

/**
 * @typedef {{width: number, height: number}} VIDEO_SIZE
 * @typedef {{min: number,   max:    number}} MIN_MAX
 */

/**
 * Video sizes
 *
 * @enum
 * @const
 */

var VIDEO = {
  /** @type VIDEO_SIZE **/
  SIZE_320x180   : { width:  320, height:  180 }, /** 16:9 **/
  SIZE_320x240   : { width:  320, height:  240 }, /**  4:3 **/
  SIZE_640x480   : { width:  640, height:  480 }, /**  4:3 **/
  SIZE_800x600   : { width:  800, height:  600 }, /**  4:3 **/
  SIZE_1024x768  : { width: 1024, height:  768 }, /**  4:3 **/
  SIZE_1280x720  : { width: 1280, height:  720 }, /** 16:9 **/
  SIZE_1920x1080 : { width: 1920, height: 1080 }, /** 16:9 **/
  SIZE_2560x1440 : { width: 2560, height: 1440 }  /** 16:9 **/
};

/**
 * Supplementary constants
 *
 * @type VIDEO_SIZE
 * @const
 */
VIDEO.SIZE_QVGA     = VIDEO.SIZE_320x240;
VIDEO.SIZE_VGA      = VIDEO.SIZE_640x480;
VIDEO.SIZE_HD_720p  = VIDEO.SIZE_1280x720;
VIDEO.SIZE_HD_1080p = VIDEO.SIZE_1920x1080;
VIDEO.SIZE_HD_1440p = VIDEO.SIZE_2560x1440;
VIDEO.SIZE_HD       = VIDEO.SIZE_HD_1440p;

/**
 * <strong>Typical Aspect Ration values </strong> <p>
 * more on aspect ratios: <http://en.wikipedia.org/wiki/Aspect_ratio_%28image%29>
 *
 * @const
 **/

var ASPECT_RATIO = {
  RATIO_4_3 : { min: 1.333, max: 1.334 }, /**  4:3 -- 320x240,  640x480,  800x600,   1024x768 **/
  RATIO_16_9: { min: 1.777, max: 1.778 }  /** 16:9 --320x180, 1280x720, 1920x1080, 2560x1440 **/
};

/**
 * <strong> Typical Frame Rate values </strong> <p>
 * <em> more on frame rates: <a href="http://en.wikipedia.org/wiki/Frame_rate">http://en.wikipedia.org/wiki/Frame_rate</a>
 *   <p>
 *   !!! Frame Rate is ignored in WebRTC in at least:
 *   Chromium Version 34.0.1847.116 Ubuntu 14.04 aura (260972)
 * </em>
 *
 * @namespace
 * @const
 * @enum
 */
var FRAME_RATE = {
  RATE_10  :  10,
  RATE_15  :  15,
  RATE_30  :  30,

  RATE_24  :  24,
  RATE_25  :  25,
  RATE_50  :  50,
  RATE_60  :  60,
  RATE_120 : 120
};

/** Media Constraints **/

/**
 * @class
 * @constructor
 *
 * @returns {MediaConstraints}
 **/
var MediaConstraints = function () {

  /**
   * @type {MediaConstraints|{}}
   */
  var that = {};

  /**
   * Result value to be passed to getUserMedia() function
   *
   * private
   *
   * typedef {Object} SetOfConstraints
   * property {number} [minFrameRate]
   * property {number} [maxFrameRate]:,
   * property {number} [minWidth]
   * property {number} [maxWidth]
   * property {number} [minHeight]
   * property {number} [maxHeight]
   * property {number} [minAspectRatio]
   * property {number} [maxAspectRatio]
   * property {string} [chromeMediaSource] // 'screen'
   * property {string} [sourceId]
   *
   *
   * typedef {Object} MandatoryAndOptional
   *   property string mandatory
   *
   *   property SetOfConstraints[] optional1
   * typedef {}
   *
   * type {{ video: string, audio: { mandatory: {string}, optional: {string} } }}
   */
  /**
   *
   * @type MediaStreamConstraints
   */
  var value = {};


  /** Audio **/

  /**
   * Set audio enabled
   *
   * @memberOf MediaConstraints
   * @param {boolean} flag
   */
  var setAudioEnabled = function (flag) {
    value.audio = flag ? { mandatory: {}, optional: [] } : false;
  };
  that.setAudioEnabled = setAudioEnabled;


  /**
   * @memberOf MediaConstraints
   */
  var enableAudioIfDisabled = function() {
    if (!value.audio) {      /** If Audio is disabled... **/
      setAudioEnabled(true); /** ...then enable it       **/
    }
  };
  that.enableAudioIfDisabled = enableAudioIfDisabled;


  /**
   * @memberOf MediaConstraints
   * @param {string} sourceId
   */
  var setAudioSource = function(sourceId) {
    if (sourceId) {
      enableAudioIfDisabled();
      value.audio.optional = [ { sourceId: sourceId } ];
    } else {
      setAudioEnabled( false );
    }
  };
  that.setAudioSource = setAudioSource;


  /** Video **/

  /**
   * @memberOf MediaConstraints
   * @param {boolean} flag
   */
  var setVideoEnabled = function (flag) {
    value.video = flag ? { mandatory: {}, optional: [] } : false;
  };
  that.setVideoEnabled = setVideoEnabled;


  /**
   * @memberOf MediaConstraints
   */
  var enableVideoIfDisabled = function() {
    if (!value.video) {    /** If Video is disabled **/
    setVideoEnabled(true); /** then enable it       **/
    }
  };
  that.enableVideoIfDisabled = enableVideoIfDisabled;


  /**
   * @memberOf MediaConstraints
   * @param {string} sourceId
   */
  var setVideoSource = function(sourceId) {
    if (sourceId) {
      enableVideoIfDisabled();
      value.video.optional = [ { sourceId: sourceId } ];
    } else {
      setVideoEnabled( false );
    }
  };
  that.setVideoSource = setVideoSource;


  /**
   * @memberOf MediaConstraints
   * @param {{VIDEO_SIZE}} minValue
   * @param {{VIDEO_SIZE}} maxValue
   */
  var setMinMaxSize = function (minValue, maxValue) {
    enableVideoIfDisabled();
    if (minValue) {
      value.video.mandatory.minWidth  = minValue.width;
      value.video.mandatory.minHeight = minValue.height;
    }
    if (maxValue) {
      value.video.mandatory.maxWidth  = maxValue.width;
      value.video.mandatory.maxHeight = maxValue.height;
    }
  };
  that.setMinMaxSize = setMinMaxSize;


  /**
   * @memberOf MediaConstraints
   * @param {number} minValue
   * @param {number} maxValue
   */
  var setMinMaxAspectRatio = function (minValue, maxValue) {
    enableVideoIfDisabled();
    if (minValue) {
      value.video.mandatory.minAspectRatio  = minValue;
    }
    if (maxValue) {
      value.video.mandatory.maxAspectRatio  = maxValue;
    }
  };
  that.setMinMaxAspectRatio = setMinMaxAspectRatio;


  /**
   * @memberOf MediaConstraints
   * @param {number} minValue
   * @param {number} maxValue
   */
  var setMinMaxFrameRate = function (minValue, maxValue) {
    enableVideoIfDisabled();
    if (minValue) {
      value.video.mandatory.minFrameRate  = minValue;
    }
    if (maxValue) {
      value.video.mandatory.maxFrameRate  = maxValue;
    }
  };
  that.setMinMaxFrameRate = setMinMaxFrameRate;


  /** Screen Share **/

  /**
   *
   * New API !!!
   * - https://groups.google.com/forum/#!msg/discuss-webrtc/TPQVKZnsF5g/fg2oBh1Er1wJ
   * - https://developer.chrome.com/extensions/desktopCapture
   * - https://developer.chrome.com/extensions/samples#desktop-capture-example
   *
   * Examples of working services:
   * - https://meet.jit.si/
   * - https://talky.io/
   **/

  /**
   * @memberOf MediaConstraints
   */
  var setScreenEnabled = function() {
    value.video.mandatory.chromeMediaSource = 'screen';
    value.audio = false; /** Audio MUST be disabled for Screen Share **/
  };
  that.setScreenEnabled = setScreenEnabled;
  /**
   * @memberOf MediaConstraints
   * @returns {boolean}
   */
  var getScreenEnabled = function() {
    return !!(value.video && value.video.mandatory && value.video.mandatory.chromeMediaSource === 'screen');
  };
  that.getScreenEnabled = getScreenEnabled;

  /**
   * @memberOf MediaConstraints
   * @param chromeMediaSourceId
   */
  var setDesktopEnabled = function(chromeMediaSourceId) {
    value.video.mandatory.chromeMediaSource = 'desktop';
    value.video.mandatory.chromeMediaSourceId = chromeMediaSourceId;
    value.audio = false; /** Audio MUST be disabled for Screen Share **/
  };
  that.setDesktopEnabled = setDesktopEnabled;
  /**
   * @memberOf MediaConstraints
   * @returns {boolean}
   */
  var getDesktopEnabled = function() {
    return !!(value.video && value.video.mandatory && value.video.mandatory.chromeMediaSource === 'desktop');
  };
  that.getDesktopEnabled = getDesktopEnabled;

  /** Get value to pass to getUserMedia function **/

  /**
   * @memberOf MediaConstraints
   * @returns {MediaConstraints|{}}
   */
  that.getValue = function() {
    return value;
  };


  /**
   * Enable audio/video and set default values
   *
   * @private
   */
  var init = function() {
    setAudioEnabled(true);
    setVideoEnabled(true);
  };

  init();

  return that;
};


if (typeof module !== 'undefined') {
  module.exports.MediaConstraints  = MediaConstraints;
  module.exports.VIDEO  = VIDEO;
}

if (typeof window !== 'undefined') {
  window.MediaConstraints  = MediaConstraints;
  window.VIDEO  = VIDEO;
}
