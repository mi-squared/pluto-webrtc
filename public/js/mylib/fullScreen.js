/**
 * Created by alykoshin on 4/5/14.
 */

'use strict';

/**
 * Object to manage Full Screen mode
 *
 * @constructor
 * @returns {FullScreen}
 */
var FullScreen = function() {

  var that = {};

  /**
   *
   * @param event
   */
  function onChange(event) {
//    console.log('fullscreenchange: getElement()', getElement() );

    /** Need to change class for the button wrtcOn <-> wrtcOff
     * we'll do it for ALL buttons - anyway, we do not see all of them...
     */
    var elements = document.getElementsByClassName('wrtcFullScreen');

    /** @type {number} **/
    for (var i=0; i < elements.length; i++) {
      elementFlipOnOff(elements[i]);
    }
  }

  document.addEventListener('fullscreenchange',       onChange);
  document.addEventListener('msfullscreenchange',     onChange);
  document.addEventListener('mozfullscreenchange',    onChange);
  document.addEventListener('webkitfullscreenchange', onChange);

  /**
   * Start Full Screen Mode
   *
   * @param HTMLElement - HTML Element to be shown on full screen
   */
  that.start = function (HTMLElement) {
    var result = true;
//          assert(element === null, 'Full Screen is already activated.');
    if      (HTMLElement.requestFullScreen)       { HTMLElement.requestFullScreen();       }
    else if (HTMLElement.msRequestFullscreen)     { HTMLElement.msRequestFullscreen();     }
    else if (HTMLElement.mozRequestFullScreen)    { HTMLElement.mozRequestFullScreen();    }
    else if (HTMLElement.webkitRequestFullScreen) { HTMLElement.webkitRequestFullScreen(); }//Element.ALLOW_KEYBOARD_INPUT); }
    else { result = false; }
    return result;
  };

  /**
   * Stop Full Screen Mode
   */
  that.stop = function () {
    var result = true;
//          assert(element !== null, 'Full Screen was not activated.');
//          assert( elem!==undefined && element !== elem, 'Full Screen activated for other element.');
    if      (document.cancelFullScreen)       { document.cancelFullScreen();       }
    else if (document.msCancelFullScreen)     { document.msCancelFullScreen();     }
    else if (document.mozCancelFullScreen)    { document.mozCancelFullScreen();    }
    else if (document.webkitCancelFullScreen) { document.webkitCancelFullScreen(); }
    else { result = false; }
    return result;
    /*      // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
     if (document.exitFullscreen) {
     document.exitFullscreen();
     } else if (document.msExitFullscreen) {
     document.msExitFullscreen();
     } else if (document.mozCancelFullScreen) {
     document.mozCancelFullScreen();
     } else if (document.webkitExitFullscreen) {
     document.webkitExitFullscreen();
     }*/
  };

  /**
   * Check whether some HTML element currently is in full screen mode
   *
   * @returns {boolean} - true if some HTML element currently is in full screen mode, false otherwise
   */
  that.getEnabled = function () {
    return !!(document.fullscreenEnabled ||
      document.msFullscreenEnabled ||
      document.mozFullscreenEnabled ||
      document.webkitIsFullScreen);
    /** https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode **/
//     if (!document.fullscreenElement &&    // alternative standard method
//     !document.mozFullScreenElement &&
//     !document.webkitFullscreenElement &&
//     !document.msFullscreenElement ) {  // current working methods
  };

  /**
   * Get the HTML Element which is currently in Full Screen Mode
   *
   * @returns {*}
   */
  that.getElement = function () {
    return document.fullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullscreenElement ||
      document.webkitFullscreenElement;
  };

  /**
   * Toggle Full Screen Mode for the HTML element
   *
   * @param HTMLElement
   */
  that.toggle = function(HTMLElement) {
    if ( ! that.getEnabled() ) {
      return that.start(HTMLElement);
    } else {
      return that.stop();
    }
  };

  return that;

};

var fullScreen = new FullScreen();

