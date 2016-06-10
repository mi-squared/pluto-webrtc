/**
 * Created by alykoshin on 7/15/14.
 */

/**
 * MediaSources - holds list of know media sources (if available)
 *
 * Firefox (as of v.30.0) does not supports
 *
 * methods:
 * - available() - returns whether possible to retreive list of medai sources
 * - retrieve(callback)  - retrieve available media sources
 * - - callback - callback when media sources retrieved
 * properties:
 * - audioSources[] - array of audio sources
 * - videoSources[] - array of video sources
 */

'use strict';

var MediaSources = function() {
  var that = {};

  /** Array of audio sources in format
   * [
   *  { label: "Default", id: "a4c49fe174daa23bd664a35af8281265f100f07e8fada18b5bcc163d0bc4cc3a" }
   *  { label: "Встроенное аудио Аналоговое стерео", id: "44d61f134a11c0d4092817d668b542724a44d42dcc32ace1f1239a4089c908dd" }
   * ]
  **/
  that.audioSources = [];

  /** Array of video sources in format
   * [
   *  { label: 'Integrated Camera (5986:02d2)', id: '5153d3314b4505b829aa613cac574cf81af3500075d3098245a1509db28a7b61'  }
   * ]
   **/
  that.videoSources = [];

  /** Media sources was successfully fetched and stored in appropriate lists (audioSources & videoSources) **/
  that.ready = false;

  /** Callback on successful retrieving of Media Sources **/
  that.onReady = null;

  /** Media sources can be retrieved **/
  that.isAvailable = function() {
    return ! (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources !== 'function');
  };

  /**
   * Callback for retrieve method
   *
   * Based on https://simpl.info/getusermedia/sources/
   *
   * @param sourceInfos
   */
  function onGetSourcesSuccess(sourceInfos) {
    debug.log('MediaSources.retrieve(): onGetSourcesSuccess() - enter');

    var source;
    that.audioSources.length = 0;
    that.videoSources.length = 0;
    for (var i = 0; i !== sourceInfos.length; ++i) {
      var sourceInfo = sourceInfos[i];
      //var option = document.createElement("option");
      //option.value = sourceInfo.id;
      if (sourceInfo.kind === 'audio') {
        source = {
          kind:  sourceInfo.kind,
          label: sourceInfo.label || 'Microphone ' + (that.audioSources.length+1),
          id:    sourceInfo.id
        };
        that.audioSources.push(source);
        debug.log('MediaSources.retrieve(): onGetSourcesSuccess(): audio: aCount:', that.audioSources.length,
          '; source.label:\'', source.label, '\'; source.id:', source.id);
      } else if (sourceInfo.kind === 'video') {
        source = {
          kind:  sourceInfo.kind,
          label: sourceInfo.label || 'Camera ' + (that.videoSources.length+1),
          id:    sourceInfo.id
        };
        that.videoSources.push(source);
        debug.log('MediaSources.retrieve(): onGetSourcesSuccess()): video: vCount:',  that.videoSources.length,
          '; source.label:\'', source.label, '\'; source.id:', source.id);
      } else {
        debug.warn('MediaSources.retrieve(): onGetSourcesSuccess(): Some other kind of source: ', sourceInfo);
      }
    }
    that.ready = false;
    debug.groupEnd();
    if ( that.onReady ) { that.onReady(); }
    debug.log('MediaSources.retrieve(): onGetSourcesSuccess() - exit');
  }

  /**
   * retrieve MediaSources
   */
  that.retrieve = function() {
    debug.log('MediaSources.retrieve() - enter');

    try {
      that.ready = false;
      if ( that.isAvailable() ){
        MediaStreamTrack.getSources( onGetSourcesSuccess );
      } else {
        debug.warn('MediaSources.retrieve(): Audio/Video Source selection is not possible:\n'+
          'This browser does not support MediaStreamTrack. Try Chrome 30+.');
      }
    } catch (error) {
      debug.error('onGetSourcesSuccess(): Error: \''+error.toString()+'\'');
      that.ready = false;
    }
    debug.log('MediaSources.retrieve() - exit');
  };

//  that.retrieve();

  return that;
}();

