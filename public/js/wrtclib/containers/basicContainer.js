/**
 * Created by alykoshin on 9/23/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
}

var BasicContainer = function(/*parentId, containerId*/) {
  var that = {};

  /**
   * Whether the container is maximized to full size of its parent element
   * @type {boolean}
   */
  that.maximized = false;
  that.parentElement = null;

//  that.parentId    = parentId;
//  that.containerId = containerId;

  that.init = function() {
//    var div = document.createElement('div');
//    parent.appendChild()
    // Nothing to do
  };

  that.addHTMLByTemplateSource = function(parentElement, templateSource, context) {
    //debug.log('Vid.addHTMLByTemplateSource(): parentElement:',parentElement, '; templateSource:', templateSource, '; context:', context);
    var result = null;
    try {
      that.template = Handlebars.compile(templateSource);
      var html      = that.template(context);

      /** Create new DIV, set its content to the result of applied template and append to parent **/
      var newElement = document.createElement('div');
      newElement.className="wrtcContainerWrapper";
      newElement.innerHTML = html;
      // Line below adds unneeded div element in hierarchy
      parentElement.appendChild( newElement );

      /** Below is wrong way as it modifies all the HTML, including previously added elements **/
      //parentElement.innerHTML += html;

      that.parentElement = parentElement;

      result = html;
    } catch (error) {
      debug.error('Error: \''+error.toString()+'\'');
    }
    return result;
    //debug.log('BasicContainer.addHTMLByTemplateSource(): result:', result);
  };

  /**
   *
   * @param parentElement              - Parent DOM Element which will hold this Container
   * @param {String} templateElementId - Handlebars template elementId in HTML file
   * @param {Object} context           - Data to apply to the template
   */
  that.addHTMLByTemplateId = function(parentElement, templateElementId, context) {
    var template = document.getElementById(templateElementId).innerHTML;
    var result   = that.addHTMLByTemplateSource(parentElement, template, context);
    // debug.log('BasicContainer.addHTMLByTemplateId(): result:', result);
  };

  /**
   * Repositioning
   */
  var SIDE = Enum( {
    LEFT:   'left',
    RIGHT:  'right',
    TOP:    'top',
    BOTTOM: 'bottom'
  } );

  var CORNER = Enum( {
    LEFT_TOP:     { SIDE1: SIDE.LEFT,  SIDE2: SIDE.TOP    },
    RIGHT_TOP:    { SIDE1: SIDE.RIGHT, SIDE2: SIDE.TOP    },
    RIGHT_BOTTOM: { SIDE1: SIDE.RIGHT, SIDE2: SIDE.BOTTOM },
    LEFT_BOTTOM:  { SIDE1: SIDE.LEFT,  SIDE2: SIDE.BOTTOM }
  } );

  that.reset = function() {
    // Dirty fix to remove fixed size

    var dimensions = ['left', 'right', 'top', 'bottom', 'height', 'width'];

    var htmlContainer = that.getContainer(); // document.getElementById(that.containerId); //
    assert(htmlContainer, 'BasicContainer.htmlContainer: ' + htmlContainer);

    for (var d in dimensions) {
      if (dimensions.hasOwnProperty(d)) {
        htmlContainer.style[dimensions[d]] = null;//'none';
      }
    }
    debug.log('BasicContainer.reset: htmlContainer.style:', htmlContainer.style);
  };

  that.getParentSize = function() {
    return {
      height: that.parentElement.clientHeight,
      width:  that.parentElement.clientWidth
    };
  };

  that.getDocumentSize = function() {
    var result = {};
    /*    if (document.body && document.body.offsetWidth) {
     result.width  = document.body.offsetWidth;
     result.height = document.body.offsetHeight;
     } else if (document.compatMode === 'CSS1Compat' &&
     document.documentElement &&
     document.documentElement.offsetWidth ) {
     result.width  = document.documentElement.offsetWidth;
     result.height = document.documentElement.offsetHeight;
     } else if (window.innerWidth && window.innerHeight) {
     result.width  = window.innerWidth;
     result.height = window.innerHeight;
     }*/

    /** http://stackoverflow.com/questions/3437786/how-to-get-web-page-size-browser-window-size-screen-size-in-a-cross-browser-wa **/
    var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0];
    result.width  = w.innerWidth || e.clientWidth || g.clientWidth;
    result.height = w.innerHeight|| e.clientHeight|| g.clientHeight;
//    debug.log('getDocumentSize(): result:', result);
    return result;
  };

  that.setPos = function(eCorner, fX, fY) {
    try {
      var iX = Math.round(fX); // Math.floor(floatX);
      var iY = Math.round(fY); // Math.floor(fY);
      // assert(SIDE.exist(sSide1) && SIDE.exist(sSide2), 'BasicContainer.setPos(): Invalid Side' +
      //  ': sSide1: \'' + sSide1 + '\'; sSide2: \''+sSide2+'\'');
      //debug.log('BasicContainer.setPos(): sSide1:',sSide1,'; iX:',iX,'; sSide2:',sSide2,'; iY:',iY);

      var htmlContainer = that.getContainer(); // document.getElementById(that.containerId); //
      assert(htmlContainer, 'BasicContainer.htmlContainer: ' + htmlContainer);

      htmlContainer.style[eCorner.SIDE1] = iX + 'px';
      htmlContainer.style[eCorner.SIDE2] = iY + 'px';
    } catch (error) {
      debug.warn('BasicContainer.setPos(): '+error.toString());
    }
  };

  that.setLeftTop = function (x, y) {
    that.setPos(CORNER.LEFT_TOP, x,   y);
  };

  that.setRightTop = function (x, y) {
    that.setPos(CORNER.RIGHT_TOP, x, y);
  };

  that.setLeftBottom = function (x, y) {
    that.setPos(CORNER.LEFT_BOTTOM, x, y);
  };

  that.setRightBottom = function (x, y) {
    that.setPos(CORNER.RIGHT_BOTTOM, x, y);
  };

  that.setXY = that.setLeftTop;

  that.setZ = function (zIndex) {
    if (zIndex) {
      var htmlContainer = that.getContainer(); //document.getElementById(prefix + 'Container_' + video.connId);
      assert(htmlContainer, 'BasicContainer.setZ(): htmlContainer: \'', htmlContainer, '\'');

      htmlContainer.style['z-index'] = zIndex;
    }
  };

  that.setSize = function(fWidth, fHeight) {
    try {
      var iWidth  = Math.round(fWidth)  /*+ 1*/; // Math.ceil(fWidth);
      var iHeight = Math.round(fHeight) /*+ 1*/; // Math.ceil(fHeight);
      // debug.log('BasicContainer.setSize(): iWidth:', iWidth, '; iHeight:', iHeight);

      var htmlContainer = that.getContainer(); /** Container - parent element for Video, overlay, controls **/
      assert(htmlContainer, 'BasicContainer.setSize(): htmlContainer: ' + htmlContainer);

      /** This reposition both htmlContainer and video OK in Chrome & FF,
       *  however not in IE10+Temasys                                 */
      htmlContainer.style.width  = iWidth  + 'px';
      htmlContainer.style.height = iHeight + 'px';
    } catch (error) {
      debug.warn('BasicContainer.setSize(): Error: '+error.toString());
    }
  };

  that.getMaximizeSize = that.getParentSize; // For normal container it is size of parent. Container Holder will overrides it to getDocumentSize
  //debug.debug('that.getMaximizeSize:', that.getMaximizeSize);

  that.maximize = function() {
    //debug.log('BasicContainer.maximizeChild(): that.getMaximizeSize:', that.getMaximizeSize);
    that.maximized = true;
    var size = that.getMaximizeSize();

    that.setXY(0, 0);
    that.setSize(size.width, size.height);
  };

  that.restore = function() {
    //debug.log('BasicContainer.maximizeChild(): that.getMaximizeSize:', that.getMaximizeSize);
    if (that.maximized) {
      that.maximized = false;
    }
  };

  var DIST_FROM_BORDER = 20;

  /** Aux function for drag-and-drop.
   * To be replaced when variable number of Local Videos will be implemented **/
  that.toNearestCorner = function(x, y) {
    var docSize = that.vid.getDocumentSize();
    var docCenter = {
      x: docSize.width  / 2,
      y: docSize.height / 2
    };
    debug.log('BasicContainer.toNearestCorner: x:', x, '; y:', y, '; docCenter.x:', docCenter.x, '; docCenter.y:', docCenter.y );
    if (x < docCenter.x) {
      if (y < docCenter.y) { that.setLeftTop(   DIST_FROM_BORDER, DIST_FROM_BORDER); }
      else                 { that.setLeftBottom(DIST_FROM_BORDER, DIST_FROM_BORDER); }
    } else {
      if (y < docCenter.y) { that.setRightTop(   DIST_FROM_BORDER, DIST_FROM_BORDER); }
      else                 { that.setRightBottom(DIST_FROM_BORDER, DIST_FROM_BORDER); }
    }
  };

  return that;
};

if (typeof module !== 'undefined') {
  module.exports = BasicContainer;
}

if (typeof window !== 'undefined') {
  window.BasicContainer  = BasicContainer;
}
