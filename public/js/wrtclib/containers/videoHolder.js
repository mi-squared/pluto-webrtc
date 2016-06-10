/**
 * Created by alykoshin on 3/21/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var BasicContainer = require('./basicContainer.js');
}


var
  FROM_BOTTOM    = 0,//280, // - to leave place for a local previews

  MIN_WIDTH      =  80, // 320,
  MIN_HEIGHT     =  80, //240,

  PREVIEW_WIDTH  = 320,
  PREVIEW_HEIGHT = 240,

  MARGIN         =  10;

var POSITIONING_DIR = Enum({
  LEFT_TO_RIGHT: 'LEFT_TO_RIGHT',
  RIGHT_TO_LEFT: 'RIGHT_TO_LEFT'
});



var VideoHolder = function(holderElementId) {
  var that    = new BasicContainer(/*parentId, holderElementId*/);

  that.muted = false;
  debug.log('need to set all the video to muted var');

  that.audioEnabled = true;
  that.videoEnabled = true;


  that.holder = document.getElementById(holderElementId);

  that.parentElement = that.holder.parentNode;

  /**
   * Pointer to maximized Child Element
   * @type {null}
   */
  that.maximizedChild = null;

  // !!! for compatibility with BasicContainer
  that.getContainer = function() { return that.holder; };
  // !!!

  that.vids   = []; // Array which holds all existing vids

  that.localOrRemote  = null; // Local or Remote Videos
  that.positioningDir = POSITIONING_DIR.LEFT_TO_RIGHT; // By default position Vids from left to right

  that._add = function(vid) {
    /** Set handler to process stream size changes
     * (especially significant when stream starts to properly position it)
     */
    vid.onStreamResize = function(width, height) {
      //      var video = vid.getVideo();
      //      if (video) {
      //        video.parentNode.style.display = 'block'; /** Make container visible **/
      //      }
      that.repositionAll();  // Adjust all positions of the videos
    };
    that.vids.push(vid);

    delayedRepositionAll(); // Reposition all elements
    return vid;
  };

  that.add = function(mediaType, mediaIndex) {
    debug.groupCollapsed('VideoHolder.add()');
    //              parent,          localOrRemote,      mediaType, mediaIndex
    var v = new Vid(that/*.holder*/, that.localOrRemote, mediaType,  mediaIndex);
    v.setMuted( that.muted );
    that._add(v);

    // Not possible to reposition Videos here as video stream is not yet received
    // and its size is not known yet
    debug.groupEnd();
    return v;
  };

  that._del = function(vid) {
    if (vid) {
      vid.cleanup();
      for (var i = that.vids.length - 1; i >= 0; i--) {
        if (that.vids[i] === vid) {
          that.vids.splice(i, 1);
        }
      }
      delayedRepositionAll(); // Reposition all elements
    }
  };

  that.count =  function() {
    return that.vids.length;
  };

  that._getVids = function() {
    return that.vids;
  };

  that.availableWidth = function() {
    return that.holder.clientWidth; //window.innerWidth,
  };

  that.availableHeight = function() {
    return that.holder.clientHeight;       //window.innerHeight;
  };

  that.adjustHolderSize = function() {
    throw 'VideoHolder.adjustHolderSize(): Call to abstract function.';
  };

  that.repositionAll = function() {
    throw 'VideoHolder.repositionAll(): Call to abstract function.';
  };



  that.getMaximizeSize = that.getDocumentSize; // For normal container it is getParentSize. For Container Holder it is getDocumentSize

  that.maximizeChild = function( container ) {
    //debug.log('VideoHolder.maximizeChild(): that.getMaximizeSize: 1', that.getMaximizeSize);
    that.maximize();
    //debug.log('VideoHolder.maximizeChild(): that.getMaximizeSize: 2', container);
    container.maximize();
    that.maximizedChild = container;
  };

  that.restoreChild = function() {
    //debug.log('VideoHolder.restoreChild()')
    that.restore();
    that.reset();
    // Restore child size
    if (that.maximizedChild) {
      that.maximizedChild.restore();
      that.maximizedChild = null;
    }
    delayedRepositionAll();
  };



  /**
   * @param {string} align
   * @param {{left: number, top: number, width: number, height: number}} area
   * @param {number} vidScreenIdx
   * @param {object[]} vids
   * @param {number} vidArrayIdx
   */
  that.repositionInLineOne = function(align, area, vidScreenIdx, vids, vidArrayIdx) {
    //console.log('repositionInLineOne: align:', align, '; area:', area, '; vidScreenIdx:', vidScreenIdx, '; vidArrayIdx:', vidArrayIdx);
    ALIGN.check(align);

    //debug.log('VideoHolder.repositionInLineOne()');
    var availW = ( area.width  -   MARGIN ) / vids.length - MARGIN;
    var availH =   area.height - 2*MARGIN;  // - FROM_BOTTOM; /** This was needed before Holder's auto resize **/

    // Limit minimum size
    if (availW < MIN_WIDTH)  { availW = MIN_WIDTH;  }
    if (availH < MIN_HEIGHT) { availH = MIN_HEIGHT; }

    var leftX = (availW + MARGIN ) * vidScreenIdx  + MARGIN;
    var topY  =  area.top + MARGIN;

    vids[ vidArrayIdx ].positionVideoInRect(align, leftX, topY, leftX+availW, topY+availH);
  };

  /**
   *
   * @param {string} align
   * @param {{left: number, top: number, width: number, height: number}} area
   * @param {object[]} vids
   */
  that.repositionInLineArray = function(align, area, vids) {
    ALIGN.check(align);

    // Reverse the order if needed
    if (that.positioningDir === POSITIONING_DIR.RIGHT_TO_LEFT) {
      vids.reverse();
    }

    for (var i = 0; i < vids.length; i++) {
      that.repositionInLineOne(align, area, i, vids, i);
    }

  };

  that.repositionInLine = function() {
    //debug.debug('repositionInLine()');

    POSITIONING_DIR.check(that.positioningDir);

    // Define area to place vids
    var area = {
      left: 0,
      top:0,
      width:  that.availableWidth(),
      height: that.availableHeight()
    };

    // Take a copy of vids array
    var vids = that.vids.slice();

    that.repositionInLineArray(ALIGN.CENTER, area, vids);
  };

  /**
   * Reposition to one big video and set af smaller below
   */
  that.repositionOneLeftOtherBelow = function() {
    //debug.debug('repositionInLine()');

    POSITIONING_DIR.check(that.positioningDir);

    var heightRatioBig = 1,   // 0.7, // 80% of height - first image, 20% for others
      heightRatioSmall = 0.3; // 1-heightRatioBig

    var area1 = {
      left:   0,
      top:    0,
      width:  that.availableWidth(),
      height: that.availableHeight() * heightRatioBig
    };
    var area2 = {
      left:   0,
      top:    that.availableHeight() * (1-heightRatioSmall),
      width:  that.availableWidth(),
      height: that.availableHeight()  * heightRatioSmall
    };

    // Take a copy of vids array
    var vids = that.vids.slice();

    if (vids.length > 0) {
      var vids1 = vids.slice(0,1);
      var vids2 = vids.slice(1);

      that.repositionInLineArray(ALIGN.LEFT, area1, vids1);
      that.repositionInLineArray(ALIGN.CENTER, area2, vids2);
    }

  };

  that.toggleMuted = function() {
    that.muted = ! that.muted;
    for (var i = 0; i < that.count(); i++) {
      that.vids[i].setMuted(that.muted);
    }
  };

  that.toggleAudioEnabled = function() {
    that.audioEnabled = ! that.audioEnabled;
    for (var i = 0; i < that.count(); i++) {
      var stream = that.vids[i].stream;
      if (stream) {
        stream.setAudioEnabled(that.audioEnabled);
      }
    }
  };

  that.toggleVideoEnabled = function() {
    that.videoEnabled = ! that.videoEnabled;
    for (var i = 0; i < that.count(); i++) {
      var stream = that.vids[i].stream;
      if (stream) {
        stream.setVideoEnabled(that.videoEnabled);
      }
    }
  };

  return that;
};

var VideoHolder2 = function(holderElementId) {
  var that = new VideoHolder(holderElementId);

  // Dynamically add video containers
  //    // Not possible to reposition Videos here as video stream is not yet received
  //    // and its size is not known yet

  that.delByConnId = function(connId) {
    debug.log('VideoHolder.delByConnId(): connId:', connId);
    var vid = that.findByConnId(connId);
    that._del(vid);
  };

  that.findByConnId = function(connId) {
    for (var i = that.vids.length-1; i >= 0; i--) {
      if (that.vids[i].getConnId() === connId)  {
        return that.vids[i];
      }
    }
    return null;
  };

  return that;
};

/**
 *
 * @type {Function}
 */

var _LocalVideoHolder = function() {
  var that = new VideoHolder2('wrtcLocalVideoHolder');

  // Local Vids must be muted
  that.muted = true;

  that.localOrRemote  = LOCAL_OR_REMOTE.LOCAL;
  that.positioningDir = POSITIONING_DIR.RIGHT_TO_LEFT; /** For LocalVideoHolder position Vids from right to left **/

  that.repositionAll = that.repositionInLine;

  that.adjustHolderSize = function() {
    //    var docSize = that.getDocumentSize();
    //
    //    that.setSize(docSize.width / 2, 280 /*docSize.height / 2*/ );
    //    that.setRightBottom(0,0);
  };

  return that;
};

/**
 *
 */

var _remoteVideoHolder = function() {
  var that = new VideoHolder2('wrtcRemoteVideoHolder');

  that.localOrRemote = LOCAL_OR_REMOTE.REMOTE;

  /*  var super_add = that.add;
   that.add = function(mediaType, infoText, connId) {
   // call inherited function
   var vid = super_add(mediaType, infoText, connId);
   return vid;
   };*/
  that.adjustHolderSize = function() {
    //    var docSize = that.getDocumentSize();
    //
    //    that.setSize(docSize.width, docSize.height - FROM_BOTTOM);
    //    that.setRightTop(0,0);
  };

  that.reposition2 = function () {
    debug.debug('reposition2()');

    var fullW  = that.availableWidth();
    var fullH  = that.availableHeight();
    // Limit minimum size;
    if (fullW < MIN_WIDTH) { fullW = MIN_WIDTH; }
    var fullH1 = (fullH < MIN_HEIGHT             ) ? MIN_HEIGHT               : fullH;
    var fullH2 = (fullH < MIN_HEIGHT+FROM_BOTTOM ) ? MIN_HEIGHT + FROM_BOTTOM : fullH;
    //if (fullH < MIN_HEIGHT) fullH = MIN_HEIGHT;

    that.vids[0].positionVideoInRect(
      ALIGN.CENTER,
      fullW  - PREVIEW_WIDTH*2 - MARGIN*2, fullH1 - PREVIEW_HEIGHT  - MARGIN,
      fullW  - PREVIEW_WIDTH   - MARGIN*2, fullH1 -                   MARGIN,
      1);
    // 4 - as remote and local to be placed near each other
    // however they are in different placeholders
    that.vids[1].positionVideoInRect(
      ALIGN.CENTER,
      0     + MARGIN,                      0,
      fullW - MARGIN,                      fullH2 - MIN_HEIGHT,
      null);
  };

  that.repositionAll = that.repositionInLine; //function() {
    //debug.debug('repositionAll()');

    //var count = that.vids.length;
    //if (count > 0) {
      //      if (count === 2) {
      //        that.reposition2();
      //      } else {
      //that.repositionInLine();
      //      }
    //}
  //};

  return that;
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Repositioning on window size change

var RESIZE_DELAY1  = 0; // Delay in ms between Window resize and repositioning of Videos
var resizeTimeout1 = null;

var RESIZE_DELAY2  = 100; // Delay in ms between Window resize and repositioning of Videos
var resizeTimeout2 = null;

function delayedRepositionAll() {

  if (remoteVideos.maximizedChild) {
    remoteVideos.maximizeChild( remoteVideos.maximizedChild );
    return; // Do not reposition if something is maximized

  } else if (LocalVideoHolder.maximizedChild) {
    LocalVideoHolder.maximizeChild( LocalVideoHolder.maximizedChild );
    return; // Do not reposition if something is maximized
  }

  if (resizeTimeout1) {
    clearTimeout( resizeTimeout1 );
  }
  if (resizeTimeout2) {
    clearTimeout( resizeTimeout2 );
  }
  resizeTimeout1 = setTimeout(function () {
    //debug.log('delayedRepositionAll(): setTimeout1()');
    remoteVideos.adjustHolderSize(); // Need to be called before repositionAll
    LocalVideoHolder.adjustHolderSize();

    resizeTimeout2 = setTimeout(function () {
      //debug.log('delayedRepositionAll(): setTimeout2()');
      remoteVideos.repositionAll();
      LocalVideoHolder.repositionAll();
    }, RESIZE_DELAY2);

  }, RESIZE_DELAY1);
}

/**
 */
addEvent(window, 'resize', delayedRepositionAll);

//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (typeof module !== 'undefined') {
  module.exports._LocalVideoHolder  = _LocalVideoHolder;
  module.exports._remoteVideoHolder = _remoteVideoHolder;
}

if (typeof window !== 'undefined') {
  window._LocalVideoHolder  = _LocalVideoHolder;
  window._remoteVideoHolder = _remoteVideoHolder;
}
