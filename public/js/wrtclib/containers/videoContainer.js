/**
 * Created by alykoshin on 6/30/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var BasicContainer   = require('./basicContainer.js');
}

var ALIGN = Enum({
  TOP:   'TOP',
  RIGHT: 'RIGHT',
  BOTTOM:'BOTTOM',
  LEFT:  'LEFT',
  CENTER: 'CENTER'
});
var LOCAL_OR_REMOTE = Enum({
  LOCAL:  'LOCAL',
  REMOTE: 'REMOTE'
});
var CLASS_LOCAL_OR_REMOTE = {};
CLASS_LOCAL_OR_REMOTE[LOCAL_OR_REMOTE.LOCAL]  = 'Local';
CLASS_LOCAL_OR_REMOTE[LOCAL_OR_REMOTE.REMOTE] = 'Remote';

var MEDIA_TYPE = Enum({
  VIDEO:  'VIDEO',
  SCREEN: 'SCREEN'
});

var CLASS_VIDEO_OR_SCREEN = {};
CLASS_VIDEO_OR_SCREEN[MEDIA_TYPE.VIDEO]  = 'Video';
CLASS_VIDEO_OR_SCREEN[MEDIA_TYPE.SCREEN] = 'Screen';

var PREFIX_BASE = 'wrtc';
var RESIZE_TIMEOUT = ONE_SECOND_MSEC / 2; // 100; // Milliseconds


//var POSTER_NONE = 'none';






var Vid = function(parentHolder, localOrRemote, mediaType, mediaIndex) {
  MEDIA_TYPE.check(mediaType);
  LOCAL_OR_REMOTE.check(localOrRemote);

  var that = new BasicContainer();

  that = Attachable(that);


  that.parent = parentHolder;
  that.stream = null;

  that.mediaType  = mediaType;
  that.mediaIndex = mediaIndex;
  that.vidId      = mediaType + '_' + mediaIndex;

  that.onStreamResize = null;  // Callback for stream resize

//  that.showActive   = true;  // null;
//  that.showInactive = false; //null;
//  that.poster       = null;

  var prefix = PREFIX_BASE + CLASS_LOCAL_OR_REMOTE[localOrRemote];


  var super_init = that.init;
  that.init = function() {
    super_init();

    debug.groupCollapsed('Vid.init()');

    // Disable browser/WebRTC specific options for user
    var i, list;

    // Check if current video element is Temasys
    if ( get_temasys_version() ) {
      // Need to disable/hide some options:
      // 1. Speaker Mute
      list = document.getElementsByClassName('wrtcSpeaker');
      for ( i = 0; i < list.length; i++ ) {
        elementHide( list[i] );
      }
    }

    // Check version of IE
    if (get_browser() === 'MSIE') { //} && get_browser_version() < 11) {
      // Need to disable/hide some options:
      // 1. FullScreen
      list = document.getElementsByClassName('wrtcFullScreen');
      for ( i = 0; i < list.length; i++ ) {
        elementDisable( list[i] );
      }
    }
    debug.groupEnd();
  };


  that.createHtml = function(mediaType, mediaIndexOrConnId, vidId, localOrRemote) {
    var TEMPLATE_ID = 'wrtcViewTemplate';
    var htmlContainer;

    assert(mediaType in MEDIA_TYPE, 'Vid.createHtml: Invalid mediaType: ' + mediaType);

    // !!! Parameter infoText was removed
    //var infoText    = '';
    // !!!


    debug.log('Vid.createHtml(): localOrRemote:', localOrRemote);

    htmlContainer   = that.addHTMLByTemplateId(that.parent.holder, TEMPLATE_ID, {
      infoText           : '', // infoText,
      vidId              : vidId,
      connId             : mediaIndexOrConnId,
      prefix             : that.prefix,
      autoplay           : true,
      // Mute local videos to prevent noise
      // Now they are muted automatically - need to test
      //
      muted              : (localOrRemote === LOCAL_OR_REMOTE.LOCAL) ? 'muted="muted"' : '',
      classVideoOrScreen : CLASS_VIDEO_OR_SCREEN[mediaType],
      classLocalOrRemote : CLASS_LOCAL_OR_REMOTE[localOrRemote]
    } );

    return htmlContainer;
  };


  var super_setSize = that.setSize;
  that.setSize = function(width, height) {
    try {
      // This reposition both htmlContainer and htmlVideo OK in Chrome & FF,
      // however not in IE10+Temasys
      super_setSize(width, height);

      width  = Math.round(width) /* + 1*/; // Math.ceil(width);
      height = Math.round(height) /*+ 1*/; // Math.ceil(height);

      var htmlVideo = that.getVideo();     // HTML Video Element


      if ( htmlVideo && htmlVideo.isTemWebRTCPlugin /* get_temasys_version() &&*/ /*&& htmlVideo.tagName === 'OBJECT' */ ) {


        /** Temasys plugin is visible as HTML element 'OBJECT',
         *  ? however, at init it looks like VIDEO(!?)
         *  ? htmlVideo.type === "application/x-temwebrtcplugin"
         *
         * htmlVideo.isTemWebRTCPlugin() seems to be more reliable method
         * For IE10+Temasys htmlVideo inside htmlContainer does not resizes automatically
         * to fit into it
         */
        htmlVideo.style.width  = width  + 'px';  // + 4
        htmlVideo.style.height = height + 'px'; // + 4
//      console.log('Vid.setSize():',// videoId:', //videoId,
//        '; htmlVideo.style.width:',  htmlVideo.style.width,
//        '; htmlVideo.style.height:', htmlVideo.style.height);
      }
    } catch (error) {
      debug.warn('Vid.setSize(): '+error.toString());
    }

  };

  that.setTextById = function(elementId, text) {
    try {
      var element = document.getElementById(elementId);
      element.innerHTML = text;
    } catch (error) {
      debug.warn('Vid.setText(): '+error.toString());
    }
  };

  that.setTextLeft = function(text) {
    that.setTextById ( prefix+'Text_'   + that.vidId +'_Left', text );
  };

  that.setTextRight = function(text) {
    that.setTextById ( prefix+'Text_'   + that.vidId +'_Right', text );
  };

  that.setQos = function(isOn) {
    //debug.log('that.setQos(): isOn:', isOn);
    var cont = that.getContainer();
    var btns = cont.getElementsByClassName('wrtcQosBtn');
    var i;
    //debug.log('that.setQos(): cont:', cont, '; btns:', btns);

    window.btns = btns;

    for (i=0; i<btns.length; i++) {
      isOn ? elementOn(btns[i]) : elementOff(btns[i]);
    }
  };

  that.setText = that.setTextLeft;

  /*********************************************************************************************************************
   * Attach Media Stream to Video Element
   *
   * @param {MediaStreamView} mediaStream
   * @returns {*}
   */
  that.attach = function(mediaStream) {
    if (!mediaStream) { debug.warn('Vid.attach(): mediaStream:', mediaStream); return; }

//    try {
    that.stream = mediaStream; /** Store mediaStream **/

    var htmlVideo = that.getVideo();
    debug.log('Vid.attach(): htmlVideo:', htmlVideo, '; mediaStream:', mediaStream);

    // Attach htmlVideo stream to HTML htmlVideo element
    if (get_temasys_version()) {
      //debug.log('Vid.attach(): temasys branch 1' +
      //  ': htmlVideo:', htmlVideo.innerHTML,
      //  '; mediaStream.stream', mediaStream.stream);

      // Temasys plugin attach
      // https://temasys.atlassian.net/wiki/display/TWPP/How+to+integrate+the+plugin+with+your+website
      //
      htmlVideo = attachMediaStream(htmlVideo, mediaStream.stream);

      //debug.log('Vid.attach(): temasys branch 2');

    } else { // Default WebRTC attach
      attachMediaStream(htmlVideo, mediaStream.stream);
    }

    that.attachTo(mediaStream);
//    mediaStream.attachingTo(that);
    //debug.log('Vid.attach(): temasys branch 3');

    // Hook to stream resize

      // debug.debug('Vid('+mediaType+'/'+mediaIndex+').attach(): that.onStreamResize: 2 ', (that.onStreamResize ? 'assigned' : 'not assigned') );
    hookStreamResize();
    //debug.log('Vid.attach(): temasys branch 4');
//    } catch (error) {
//      debug.error('Error: \''+error.toString()+'\'');
//    }
    return htmlVideo;
  };

  that.detach = function() {
    var htmlVideo = that.getVideo();
    debug.log('Vid.detach(): htmlVideo:', htmlVideo, '; that.stream:', that.stream);

    if (htmlVideo) {
      detachMediaStream( htmlVideo );
    }
    if (that.stream) {
      //that.stream.detachingFrom( that );
      //that.stream = null;
      that.detachFrom(that.stream);
    }
  };

  /**
   * ! Moved to CSS !
   * Show video stream resolution in top-left corner i.e. 640x480
   * @type {boolean}
   */
  //var SHOW_DIMENSIONS = false;

  /**
   *  Catch stream resize event (including IE workaround)
   *  when new stream arrives, we need to get its width/height to resize later htmlContainer
   */
  function hookStreamResize() {
    var oldWidth  = 0;
    var oldHeight = 0;
    try {
      //debug.debug('Vid('+mediaType+'/'+mediaIndex+').hookStreamResize(): that.onStreamResize: 1 ', ( that.onStreamResize ? 'assigned' : 'not assigned') );

      // Previosly we checked if we are using Temasys/IE10 plugin or Firefox,
      // but now we try to use both ways simultaneously to react on stream resize
      //
//      if ( get_temasys_version() /*|| get_browser()==='Firefox'*/) {
//        debug.info('remoteVideos.attachStream(): We are using Temasys plugin or Firefox, ' +
//          'need workaround as it does not support all the video events like "playing", "play" etc');
      var checkInterval = null;

      /** Workaround fo IE10+Temasys and Firefox **/
      checkInterval = setInterval( function() {
        var v  = that.getVideo();
        // If video element does not exists, stop checking
        // (most probably, video session was finished)
        if ( !v ) {
          clearInterval(checkInterval);
          return;
        }
        var width  = that.getVideoWidth();
        var height = that.getVideoHeight();

        if (oldWidth !== width && oldHeight !== height) {

//          if (width && height) {
//            debug.info('Vid('+mediaType+'/'+mediaIndex+').hookStreamResize(): Video size: ' + width +'x' + height +'.' );
//          } else {
//            debug.info('Vid('+mediaType+'/'+mediaIndex+').hookStreamResize(): Video size: unknown.' );
//          }
          var dimensions = (width && height) ? width +'x' + height : 'unknown';

          debug.info('Vid('+mediaType+'/'+mediaIndex+').hookStreamResize(): checkInterval(): Video size: ' + dimensions +'.' );

          oldWidth  = width;
          oldHeight = height;

          that.setVisible();

          // Moved to CSS
          //if (SHOW_DIMENSIONS) {
            that.setTextRight(dimensions);
          //}
          if (that.onStreamResize) { that.onStreamResize(width, height); }
        }
      }, RESIZE_TIMEOUT );
//      } else {
      // we are nor using Temasys plugin nor Firefox (does it really works for Firefox ??? )
      //  then it's probably Chrome and we can catch video events correctly
      //
      //  http://webrtchacks.com/how-to-figure-out-webrtc-camera-resolutions
      //  webrtcH4cKS: ~ How to Figure Out WebRTC Camera Resolutions
      var htmlVideo = that.getVideo();
      htmlVideo.addEventListener('playing', function () {

        var width  = that.getVideoWidth();
        var height = that.getVideoHeight();

        var dimensions = (width && height) ? width +'x' + height : 'unknown';

        debug.info('Vid('+mediaType+'/'+mediaIndex+').hookStreamResize(): addEventListener: playing: Video size: ' + dimensions +'.' );

        that.setVisible();
        // Moved to CSS
        //if (SHOW_DIMENSIONS) {
          that.setTextRight(dimensions);
        //}
        if (that.onStreamResize) { that.onStreamResize(width, height); }
      });
//      }
    } catch (error) {
      debug.error('Error: \''+error.toString()+'\'');
    }
  }

  /**
   *
   * @param {string} align
   * @param leftX
   * @param topY
   * @param rightX
   * @param bottomY
   * @param z
   */
  that.positionVideoInRect = function(align, leftX, topY, rightX, bottomY, z) { //availW, availH) {
    ALIGN.check(align);

    var videoH = that.getVideoHeight();
    var videoW = that.getVideoWidth();

    videoH = videoH ? videoH : DEFAULT_VIDEO_SIZE.height;
    videoW = videoW ? videoW : DEFAULT_VIDEO_SIZE.width;

    var
      availW = rightX - leftX,
      availH = bottomY - topY;
    var
      coeffW = availW / videoW,
      coeffH = availH / videoH;

    var w, h;
    if (coeffW > coeffH) {
      w = videoW * coeffH;
      h = videoH * coeffH;
    } else {
      w = videoW * coeffW;
      h = videoH * coeffW;
    }

    var x, y;
    if      (align === ALIGN.LEFT  )  { x = 0; }
    else if (align === ALIGN.CENTER)  { x = availW/2 - w/2; }
    else  /* align === ALIGN.RIGHT */ { x = availW - w; }
    y = availH/2 - h/2;

    var absX, absY;
    absX = leftX + x;
    absY = topY  + y;

    that.setSize( w,    h);
    that.setXY(   absX, absY);
    that.setZ(z);
  };

  /**
   * Overrides BasicContainer.maximize to adjust video size according not only to parent's dimensions,
   * but to video too
   */
  that.maximize = function() {
    //debug.log('BasicContainer.maximizeChild(): that.getMaximizeSize:', that.getMaximizeSize);
    that.maximized = true;
    var size = that.getMaximizeSize();
    that.positionVideoInRect(ALIGN.CENTER, 0,0,size.width, size.height)
  };

  that.cleanup = function() {
    that.detach();

    //that.stream = null;
    var htmlVideo   = that.getVideo();
    //console.log('Vid.cleanup(): htmlVideo:', htmlVideo);
    //if (htmlVideo) { htmlVideo.src = ''; }

    var htmlOverlay   = that.getOverlay();
    //console.log('Vid.cleanup(): htmlOverlay:', htmlOverlay);

    var htmlContainer = that.getContainer();
    //console.log('Vid.cleanup(): htmlContainer:', htmlContainer);

    // There is one div between VideoHolder and VideoContainer
    var htmlParentDiv   = htmlContainer.parentNode;
    var htmlVideoHolder = htmlParentDiv.parentNode;

    if (htmlContainer) {
      if (htmlVideo)   { htmlContainer.removeChild(htmlVideo);   } // Remove Video
      if (htmlOverlay) { htmlContainer.removeChild(htmlOverlay); } // Remove Overlay
      if (htmlParentDiv) {
        htmlParentDiv.removeChild(htmlContainer);   // Remove Container
        if (htmlVideoHolder) {
          htmlVideoHolder.removeChild(htmlParentDiv); // Remove <div>
        }
      }
    }
  };

  that.getContainer = function() {
    var elementId = prefix + 'Container_' + that.vidId;
    var htmlElement = document.getElementById(elementId);
    //if (!htmlElement) { debug.warn ('getContainer(): Error: htmlElement is empty:', htmlElement); }
    return htmlElement;
  };

  that.getOverlay = function()   {
    var elementId = prefix + 'Overlay_'   + that.vidId;
    var htmlElement = document.getElementById(elementId);
    //if (!htmlElement) { debug.warn ('getOverlay(): Error: htmlElement is empty:', htmlElement); }
    return htmlElement;
  };

  that.getVideo = function() {
    var elementId = prefix + 'Element_'   + that.vidId;
    //console.log('!!!!!!!!!!', elementId);
    var htmlElement = document.getElementById(elementId);
    // if (!htmlElement) { debug.warn ('getOverlay(): Error: htmlElement is empty:', htmlElement); }
    return htmlElement;
  };

  that.getConnId      = function() { return mediaIndex;    };


  var DEFAULT_VIDEO_SIZE = VIDEO.SIZE_320x240;

  that.getVideoWidth  = function() {
    var result;
    var htmlVideo = that.getVideo();
    // Temasys/IE10 uses videoTrackHeight & videoTrackWidth
    if (htmlVideo) {
      result = htmlVideo.videoWidth  ? htmlVideo.videoWidth  : htmlVideo.videoTrackWidth;
    } else {
      result = DEFAULT_VIDEO_SIZE.width;
    }
    return result;
  };

  that.getVideoHeight = function() {
    var result;
    var htmlVideo = that.getVideo();

    // Temasys/IE10 uses videoTrackHeight & videoTrackWidth
    if (htmlVideo) {
      result = htmlVideo.videoHeight ? htmlVideo.videoHeight : htmlVideo.videoTrackHeight;
    } else {
      result = DEFAULT_VIDEO_SIZE.height;
    }
    return result;
  };

  that.getVideoSize = function() {
    return ( { width: that.getVideoWidth(), height: that.getVideoHeight } );
  };

  that.setVisible = function() {
    //debug.log('Vid.setVisible(): that.isActive():', that.isActive(), '; that.showActive:', that.showActive, '; that.showInactive:',that.showInactive);

    // Set video visibility
    //that.getContainer().style.display =
    //  (that.isActive() && that.showActive) || (!that.isActive() && that.showInactive) ?
    //    'block' : 'none';

    // Set poster (static picture) visibility
    //var posterImageUrl;

    //var class1 = that.isActive() ? 'wrtcActiveFalse' : 'wrtcActiveTrue';
    if ( that.isActive() ) {        // If we have stream
      elementSetClass( that.getContainer(), 'wrtcActiveFalse', 'wrtcActiveTrue');
    } else {
      elementSetClass( that.getContainer(), 'wrtcActiveTrue',  'wrtcActiveFalse');
    }

    if ( that.stream && that.stream.hasVideo() ) { // ...and there is Video tracks
      elementSetClass( that.getContainer(), 'wrtcVideoFalse', 'wrtcVideoTrue');
    } else {                        // ...if no Video Tracks
      elementSetClass( that.getContainer(), 'wrtcVideoTrue', 'wrtcVideoFalse');
    }

  };

  //that.setShowInactive = function (value) {
  //  that.showInactive = value;
  //  that.setVisible();
  //};
  //
  //that.setShowActive = function (value) {
  //  that.showActive = value;
  //  that.setVisible();
  //};
  //
  //that.setPoster = function (value) {
  //  that.poster = value;
  //  that.setVisible();
  //};

  that.isActive = function() {
    return !! that.stream;
  };

  that.createHtml(that.mediaType, that.mediaIndex, that.vidId, localOrRemote);


  that.setMuted = function(value) {
    var htmlVideo = that.getVideo();
    if (htmlVideo) {
      htmlVideo.muted = value;
    }
  };

  that.toggleMuted = function() {
    var htmlVideo = that.getVideo();
    if (htmlVideo) {
      htmlVideo.muted = ! htmlVideo.muted;
    }
    elementFlipOnOff(that.getContainer().getElementsByClassName('wrtcSpeakerBtn'));
    debug.log('need to set element class according to real element state');

  };

  that.toggleFullScreen = function() {
    var htmlVideo = that.getVideo(); // getVideoByButton(sender);
    var isFullScreen = false;

    if (htmlVideo) {
      var fullScreenToggled = fullScreen.toggle(htmlVideo);

      if ( ! fullScreenToggled ) {
        debug.warn('wrtcFullScreenBtn click: fullScreen.toggle(htmlVideo) not supported. fallback to maximize.');

        if (that.maximized) {
          that.parent.restoreChild();

        } else {
          that.parent.maximizeChild(that);
          isFullScreen = true;
        }
      } else {
        isFullScreen = fullScreen.getEnabled();
      }
    }
    elementSetOnOff( that.getContainer().getElementsByClassName('wrtcFullScreenBtn'), isFullScreen);
    //elementFlipOnOff( document.getElementsByClassName('wrtcFullScreenBtn') );
  };

  that.toggleVideoEnabled = function() {
    if (that.stream) {
      that.stream.toggleVideoEnabled();
      elementSetOnOff( that.getContainer().getElementsByClassName('wrtcVideoBtn'), that.stream.videoEnabled );
    }
  };


  // Attach events to buttons

  var htmlContainer = that.getContainer();

  addEvent(htmlContainer, 'dblclick', function(event) {
    debug.log('htmlContainer dblclick');
    that.toggleFullScreen();
    event.preventDefault(); event.stopPropagation();
  });

  addEventByClass(htmlContainer, 'wrtcPanel', 'dblclick', function(event) {
    debug.log('wrtcPanel dblclick');
    // Ignore double clicks on panels with buttons
    event.preventDefault(); event.stopPropagation();
  });

  addEventByClass(htmlContainer, 'wrtcSpeakerBtn', 'click', function(event) {
    debug.log('wrtcSpeakerBtn click');
    that.toggleMuted();
    event.preventDefault(); event.stopPropagation();
  });

  addEventByClass(htmlContainer, 'wrtcVideoBtn', 'click', function(event) {
    debug.log('wrtcVideoBtn click');
    // At some time muting for screencast was disabled in Chrome source code
    // More info: https://code.google.com/p/chromium/codesearch#chromium/src/third_party/libjingle/source/talk/media/webrtc/webrtcvideoengine.cc&q=Disable%20muting%20for%20screencast.&sq=package:chromium&type=cs&l=3232
    that.toggleVideoEnabled();
    event.preventDefault(); event.stopPropagation();
  });

  addEventByClass(htmlContainer, 'wrtcMicBtn', 'click', function(event) {
    debug.log('wrtcMicBtn click');
    if (that.stream) {
      that.stream.toggleAudioEnabled();
      elementFlipOnOff(event.target);
    }
    event.preventDefault(); event.stopPropagation();
  });

  addEventByClass(htmlContainer, 'wrtcInfoBtn', 'click', function(event) {
    debug.log('wrtcInfoBtn click');
    var htmlVideo = that.getVideo(); // getVideoByButton(sender);
    if (htmlVideo) {
      doShowStats(htmlVideo);
    }
    event.preventDefault(); event.stopPropagation();
  });

  addEventByClass(htmlContainer, 'wrtcFullScreenBtn', 'click', function(event) {
    debug.log('wrtcFullScreenBtn click');
    that.toggleFullScreen();
    event.preventDefault(); event.stopPropagation();
  });

  addEventByClass(htmlContainer, 'wrtcHangupOneBtn', 'click', function (event) {
    // find one of parents which contains data-conn-id attribute
    var el = event.target;
    var cls = 'wrtcContainer';
    while ((el = el.parentElement) && !el.classList.contains(cls));
    var connId = el.getAttribute('data-conn-id');

    console.log('el:', el, '; connId:', connId);
    //
    // find connection
    var conn = peerConnections.find(connId);
    if (!conn) { console.error('wrtcHangupOneBtn: Connection not found: connId:', connId); }
    peerConnections.hangupFromLocal(conn.remoteUser, conn.connId);
  });



  that.init();

  return that;
};

/*
 // http://www.html5rocks.com/en/tutorials/getusermedia/intro/
 // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
 // See crbug.com/110938.
 self.video.onloadedmetadata = function(e) {
 console.log('localMedia.start(): success: self.video.onloadedmeadata()');
 };

 */
/*
 // All of following does not works in IE10+Temasys
 //
 // https://hacks.mozilla.org/2013/02/cross-browser-camera-capture-with-getusermediawebrtc/
 video.addEventListener('loadstart', function() {
 console.log('video.addEventListener("loadstart"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);
 video.addEventListener('progress', function() {
 console.log('video.addEventListener("progress"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);
 // http://www.html5rocks.com/en/tutorials/getusermedia/intro/
 // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
 // See crbug.com/110938.
 video.addEventListener('loadedmetadata', function() {
 console.log('video.addEventListener("onloadedmetadata"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);
 video.addEventListener('loadeddata', function() {
 console.log('video.addEventListener("loadeddata"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);
 video.addEventListener('canplay', function() {
 console.log('video.addEventListener("canplay"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);
 video.addEventListener('canplaythrough', function() {
 console.log('video.addEventListener("canplaythrough"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);
 video.addEventListener('play', function() {
 console.log('video.addEventListener("play"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);
 video.addEventListener('playing', function() {
 console.log('video.addEventListener("playing"): Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }, false);

 video.playing = function() {
 console.log('video.onplaying: Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
 }

 progress

 */

if (typeof module !== 'undefined') {
  module.exports.Vid = Vid;
  module.exports.LOCAL_OR_REMOTE = LOCAL_OR_REMOTE;
  module.exports.MEDIA_TYPE = MEDIA_TYPE;
  module.exports.ALIGN = ALIGN;
}

if (typeof window !== 'undefined') {
  window.Vid  = Vid;
  window.LOCAL_OR_REMOTE  = LOCAL_OR_REMOTE;
  window.MEDIA_TYPE  = MEDIA_TYPE;
  window.ALIGN  = ALIGN;
}
