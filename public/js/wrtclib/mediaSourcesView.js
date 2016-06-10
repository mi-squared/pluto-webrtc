/**
 * Created by alykoshin on 7/22/14.
 */

"use strict";

/**
 *
 * !!! Dirty !!!
 *
 */

var RESTORE_SOURCES = false;
var SELECT_FIRST    = true;
var MSG_NO_VIDEO    = 'NO MEDIA';
var VIDEO2_AUDIO    = false;

MediaSources.onChange = null;
MediaSources.populateCombos = function(index_) {

  function addOption(htmlSelect, value, text) {
    var option   = document.createElement("option");
    option.value = value;
    option.text  = text;
    htmlSelect.appendChild(option);
  }

  var index = index_ || 1;

  /** media sources not available for Firefox
   * Hide panel if not accessible   **/

  var panel = document.getElementById('wrtcMediaSourceSelect_' + index);
  panel.style.display = MediaSources.isAvailable() ? 'block' : 'none';

  /** Fill audio sources **/

  var audioSelect = document.getElementById('wrtcAudioSource_' + index);
  // Clear drop down list
  var length = audioSelect.options.length;
  for (i = 0; i < length; i++) {
    audioSelect.options[i] = null;
  }
  // Add empty option
  addOption(audioSelect, '', MSG_NO_VIDEO);
  // Add sources
  for (var i = 0; i < MediaSources.audioSources.length; i++) {
    var sourceInfo = MediaSources.audioSources[i];
    addOption(audioSelect, sourceInfo.id, sourceInfo.label);
  }

  var cookieName = 'audiosource_'+index;
  if (RESTORE_SOURCES) {
    var cookieValue = getCookie(cookieName);
    if (cookieValue) {
      audioSelect.value = cookieValue;
    }
  } else {
    //audioSelect.value = '';
    audioSelect.selectedIndex = SELECT_FIRST ? 0 : -1;
  }
  audioSelect.onchange = function() {
    setCookie(cookieName, audioSelect.value, COOKIE_NEVER_EXPIRES);
    if (MediaSources.onChange) { MediaSources.onChange(); }
  };

  var videoSelect = document.getElementById('wrtcVideoSource_' + index);
  // Clear drop down list
  var length = videoSelect.options.length;
  for (i = 0; i < length; i++) {
    videoSelect.options[i] = null;
  }
  // Add empty option
  addOption(videoSelect, '', MSG_NO_VIDEO);
  // Add sources
  for (var i = 0; i < MediaSources.videoSources.length; i++) {
    var sourceInfo = MediaSources.videoSources[i];
    addOption(videoSelect, sourceInfo.id, sourceInfo.label);
//    var option     = document.createElement("option");
//    option.value = sourceInfo.id;
//    option.text  = sourceInfo.label;// || 'camera ' + (videoSelect.length + 1);
//    videoSelect.appendChild(option);
  }
  var cookieName = 'videosource_'+index;

  if (RESTORE_SOURCES) {
    var cookieValue = getCookie(cookieName);
    if (cookieValue) {
      videoSelect.value = cookieValue;
    }
  } else {
    // videoSelect.value = '';
    videoSelect.selectedIndex = SELECT_FIRST ? 0 : -1;
  }
  videoSelect.onchange = function() {
    setCookie(cookieName, videoSelect.value, COOKIE_NEVER_EXPIRES);
    if (MediaSources.onChange) { MediaSources.onChange(); }
  };

};

/**
 *
 * @param {number} index
 * @returns {string|null}
 */
MediaSources.getAudioSourceId = function(index) {
  if (VIDEO2_AUDIO) {
    return document.getElementById('wrtcAudioSource_' + index).value;
  } else {
    return null;
  }
};

/**
 *
 * @param {number} index
 * @returns {string|null}
 */
MediaSources.getVideoSourceId = function(index) {
  return document.getElementById('wrtcVideoSource_' + index).value;
};

/**
 *
 * @param {number} localVideoIndex
 * @param {LocalVideo} localVideoObject
 */
MediaSources.applySources = function(localVideoIndex, localVideoObject) {
  localVideoObject.audioSource = MediaSources.getAudioSourceId(localVideoIndex);//as;
  localVideoObject.videoSource = MediaSources.getVideoSourceId(localVideoIndex);//vs;
};
