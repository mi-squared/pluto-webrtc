(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by alykoshin on 9/3/14.
 */

'use strict';

/**
 *
 * Based on WildEmitter
 * @see {@link https://github.com/HenrikJoreteg/wildemitter/blob/master/wildemitter.js}
 *
 * Also good emitter is {@link https://github.com/asyncly/EventEmitter2}
 *
 * Usage:
 *   obj = {}; Emitter(obj);
 *   obj.on('something', function(param) { console.log(arguments); } );
 *   obj.emit('something', 'data1', 'data2');
 *
 * @class Emitter
 * @mixin
 * @constructor
 */

var Emitter = function(that) {

  /**
   * @type {{}}
   * @memberOf Emitter
   */
  that.callbacks = {};

  /**
   * Listen on the given 'eventName' with 'fn'. Store a group name if present.
   *
   * @memberOf Emitter
   * @param {string || string[]} eventNames
   * @param {string} [groupName]
   * @param {callback} fn
   **/
  that.on = function (eventNames, groupName, fn) {
//    that._assertName(eventName);
    if (!eventNames) { throw 'Emitter.on(): eventNames not provided'; }

    if (typeof eventNames === 'string') { eventNames = [eventNames]; }
    var hasGroup = (arguments.length === 3),
      group = hasGroup ? arguments[1] : undefined,
      func  = hasGroup ? arguments[2] : arguments[1];

    func._groupName = group;
    for (var len=eventNames.length, i=0; i<len; ++i) {
      var eventName = eventNames[i];
      that.callbacks[eventName] = that.callbacks[eventName] || [];
      that.callbacks[eventName].push(func);
    }
    return that;
  };

  /**
   * Adds an `eventName` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {string || string[]} eventNames
   * @param {string} [groupName]
   * @param {callback} fn
   **/
  that.once = function (eventNames, groupName, fn) {
    if (!eventNames) { throw 'Emitter.once(): eventNames not provided'; }

    function doOnceClosure(eventName) {
      return function doOnce() {
        that.off(eventName, doOnce);
        func.apply(that, arguments);
      };
    }
//    that._assertName(eventName);
    if (typeof eventNames === 'string') { eventNames = [eventNames]; }
    var hasGroup = (arguments.length === 3),
      group = hasGroup ? arguments[1] : undefined,
      func  = hasGroup ? arguments[2] : arguments[1];

    for (var len=eventNames.length, i=0; i<len; ++i) {
      var eventName = eventNames[i];

      that.on(eventName, group, doOnceClosure(eventName));
    }
    return that;
  };

  /**
   * Unbinds an entire group
   *
   * memberOf Emitter
   * @param {string} groupName
   **/

  that.releaseGroup = function (groupName) {
    for (var eventName in that.callbacks) {
      if ( that.callbacks.hasOwnProperty(eventName) ) {
        var callbacks = that.callbacks[eventName];
        var i = 0;
        while (i < callbacks.length) {
          if (callbacks[i]._groupName === groupName) {
            callbacks.splice(i, 1);
          } else {
            i++;
          }
        }
      }
    }
    return that;
  };


  /**
   * Remove the given callback for `eventName` or all
   * registered callbacks.
   *
   * @param {string || string[]} eventNames
   * @param {callback} fn
   **/
  that.off = function (eventNames, fn) {
    //   that._assertName(eventName);
    if (!eventNames) { throw 'Emitter.off(): eventNames not provided'; }

    if (typeof eventNames === 'string') { eventNames = [eventNames]; }

    for (var len=eventNames.length, i=0; i<len; ++i) {
      var eventName = eventNames[i];

      var eventCallbacks = that.callbacks[eventName];

      if (!eventCallbacks) {
        continue;
      }

      // remove all handlers
      if (arguments.length === 1) {
        // delete that.callbacks[eventName];
        that.callbacks[eventName] = [];
        continue;
      }

      // remove specific handler
      var idx = eventCallbacks.indexOf(fn);
      eventCallbacks.splice(idx, 1);
      continue;
    }
    return that;
  };

  /** Emit `eventName` with the given args.
   * also calls any `*` handlers
   *
   * @param {string} eventName
   **/
  that.emit = function (eventName) {
//    that._assertName(eventName);
    if (!eventName) { throw 'Emitter.emit(): eventName not provided'; }

    var args = [].slice.call(arguments, 1),
      callbacks        = that.callbacks[eventName],
      specialCallbacks = that.getWildcardCallbacks(eventName),
      i,
      len,
      handled = false,
//    item,
      listeners;

    if (callbacks) {
      listeners = callbacks.slice();
      for (i = 0, len = listeners.length; i < len; ++i) {
        if (listeners[i]) {
          // debug.log('Emitter: ' + typeof this + '.on(' + eventName + ', ', arguments, ')');
          listeners[i].apply(that, args);
          handled = true;
        } else {
          break;
        }
      }
    }

    if (specialCallbacks) {
      //len = specialCallbacks.length;
      listeners = specialCallbacks.slice();
      for (i = 0, len = listeners.length; i < len; ++i) {
        if (listeners[i]) {
          debug.log('Emitter: ' + typeof this + '.on(' + eventName + ', ', arguments, ')');
          listeners[i].apply(that, /*[eventName].concat(*/args/*)*/);
          handled = true;
        } else {
          break;
        }
      }
    }

    if (!handled) { debug.warn('Emitter: Event emitted, but not handled:', eventName); }

    return that;
  };

  /**
   * Helper for for finding special wildcard event handlers that match the event
   *
   * @param {string} eventName
   **/
  that.getWildcardCallbacks = function (eventName) {
    var item,
      split,
      result = [];

    for (item in that.callbacks) {
      if (that.callbacks.hasOwnProperty(item)) {
        split = item.split('*');
        if (item === '*' || (split.length === 2 && eventName.slice(0, split[0].length) === split[0])) {
          result = result.concat(that.callbacks[item]);
        }
      }
    }
    return result;
  };

  return that;
};




var ValidatingEmitter = function(that) {

  Emitter(that);

  /**
   * Array of registered events
   *
   * @type {Array}
   * @memberOf Emitter
   */

  that.registered = [];

//  that.findReg = function(eventName/*, groupName*/) {
//    //groupName = groupName || undefined;
//    for (var i= 0; i < that.registered.length; i++) {
//      if (that.registered[i].eventName === eventName /*&& that.registered[i].groupName === groupName*/) {
//        return i;
//      }
//    }
//    return -1;
//  };

  that.isRegistered = function(eventName/*, groupName*/) {
    //groupName = groupName || undefined;
    //return (that.findReg(eventName/*, groupName*/) >= 0);
    return that.registered.indexOf(eventName) >= 0;
  };

  that._assertName = function(eventName/*, groupName*/) {
    //groupName = groupName || undefined;
    if ( ! that.isRegistered(eventName/*, group*/) ) {
      throw('Emitter.on(): Event is not regged' +
      ': eventName: \''+eventName + '\'' /* +
       '; groupName: \''+group     + '\'' */ );
    }
  };

  /**
   * Register new Event
   *
   * @param eventName
   */
  that.reg = function(eventName) {
    that.registered.push( eventName );
  };

  /**
   * Unregister Event
   *
   * @param eventName
   */
  that.unreg = function(eventName) {
    var i = that.registered.indexOf(eventName);
    that.registered.splice(i,1);
  };

  var old_on = that.on;
  that.on = function (eventName, groupName, fn) {
    that._assertName(eventName);
    return old_on(eventName, groupName, fn);
  };

  var old_once = that.once;
  that.once = function (eventName, groupName, fn) {
    that._assertName(eventName);
    return old_once(eventName, groupName, fn);
  };

  /**
   * Remove the given callback for `eventName` or all
   * registered callbacks.
   *
   * @param {string} eventName
   * @param {callback} fn
   **/

  var old_off = that.off;
  that.off = function (eventName, fn) {
    that._assertName(eventName);
    return old_off(eventName, groupName, fn);
  };

  /** Emit `eventName` with the given args.
   * also calls any `*` handlers
   *
   * @param {string} eventName
   **/
  var old_emit = that.emit;
  that.emit = function (eventName) {
    that._assertName(eventName);
    return old_emit(eventName);
  };

  return that;
};


if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

if (typeof window !== 'undefined') {
  window.Emitter  = Emitter;
}

},{}],2:[function(require,module,exports){
/**
 * Created by alykoshin on 3/23/14.
 */

'use strict';

/**
 * Returns whether the script runs on Server side (Node.js)
 * @returns {boolean}
 */
function isServer( ) {
  return (typeof document === 'undefined');
}

/**
 * Returns whether the script runs on Client side (Browser)
 * @returns {boolean}
 */
function isClient() {
  return ! isServer();
}

//isClient();

/**
 * Constants
 **/

/** @type {number} **/
var ONE_SECOND_MSEC = 1000;
/** @type {number} **/
var ONE_MINUTE_MSEC = ONE_SECOND_MSEC * 60;
/** @type {number} **/
var ONE_HOUR_MSEC   = ONE_MINUTE_MSEC * 60;
/** @type {number} **/
var ONE_DAY_MSEC    = ONE_HOUR_MSEC   * 24;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Full version of `log` that:
//  * Prevents errors on console methods when no console present.
//  * Exposes a global 'log' function that preserves line numbering and formatting.
var _debug = function (obj) {
  var that = {};

  that.obj = obj;

  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
  ];

  if ( typeof window !== 'undefined') {
    window.console = window.console || {};
    var console    = window.console;
  }

  if (!console['debug']) { console.debug = console.log; } // IE does not support debug.

  var length = methods.length;
  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if ( ! console[method] ) { // .hasOwnProperty(method) ) { // !console[method] ) {
      console[method] = noop; // Disable for console
      that[method]    = noop; // and for this object too
    } else {
      if (Function.prototype.bind) {
        that[method] = Function.prototype.bind.call(console[method], console, '%s'); // '%s' does not works for group
      } else {
        that[method] = Function.prototype.apply.call(console[method], console, 'xyz',arguments);
      }
    }
  }
  //if(that.obj) {
  //  console.log('>>>>>>>>>>>>', that.obj.debugId, that.obj);
  // }
  //  if (!console.debug) { // IE does not support console.debug
  //    that.debug = Function.prototype.bind.call(console.log,   console, pref + ' **** debug:   %s');;
  //  } else {
  //    that.debug = Function.prototype.bind.call(console.debug, console, pref + ' **** debug: %s');
  //  }

  /** Rewrite specific methods **/
  if (Function.prototype.bind) {
    // console.log('_debug(): if (Function.prototype.bind) ');
    var pref = '[' + ( (that.obj && that.obj.debugId) ? that.obj.debugId : 'null') +']';


    that.error = Function.prototype.bind.call(console.error, console, pref + ' * error: %s');
    that.warn  = Function.prototype.bind.call(console.warn , console, pref + ' ** warn:  %s');
    that.info  = Function.prototype.bind.call(console.info,  console, pref + ' *** info:  %s');
    if (!console.debug) { // IE does not support console.debug
      that.debug = Function.prototype.bind.call(console.log,   console);//pref + ' **** debug:   %s');;
    } else {
      that.debug = Function.prototype.bind.call(console.debug, console);//pref + ' **** debug: %s');
    }
    that.log   = Function.prototype.bind.call(console.log,   console, pref + ' ***** log:   %s');
    //    that.group = Function.prototype.bind.call(console.group, console, '%s');
    that.group = Function.prototype.bind.call(console.log, console, pref + ' GROUP:   %s');
    //    that.groupCollapsed = Function.prototype.bind.call(console.groupCollapsed, console, '%s');
    that.groupCollapsed = Function.prototype.bind.call(console.log, console, pref + ' GROUP: %s');
    //    if (!that.assert) { that.assert = Function.prototype.bind.call(console.error, console, '* assert: %s'); }
    //  } else {
    //    that.error = function() { Function.prototype.apply.call(console.error, console, arguments); };
    //    that.warn  = function() { Function.prototype.apply.call(console.warn , console, arguments); };
    //    that.info  = function() { Function.prototype.apply.call(console.info,  console, arguments); };
    //    that.debug = function() { Function.prototype.apply.call(console.debug, console, arguments); };
    //    that.log   = function() { Function.prototype.apply.call(console.log,   console, arguments); };
  }

  return that;
};
var debug = _debug();
//var debug = console;

var assert     = function(condition, message) {
  if (!condition) {
    throw message ? 'Assertion failed: \'' + message +'\'': 'Assertion failed.';
  }
};
//var assert = debug.assert;

//assert(false, 'test-message');

//window.console = null;


// My unsuccessful experiments........ :(


/*
 // https://raw.githubusercontent.com/cowboy/javascript-debug/master/ba-debug.js
 window.debug = ( function(){
 var window = this,
 con = window.console,
 that = {}//,
 ;

 var dev_mode = true;
 that._debug = con.log.bind( con , '%s');
 */

/*
 function //log
 // ( msgOrObj ){
 if(dev_mode){
 try {  invalidfunctionthrowanerrorplease(); }
 catch(err) {  var logStack = err.stack;  }
 var fullTrace = logStack.split('\n');
 for( var i = 0 ; i < fullTrace.length ; ++i ){
 fullTrace[i] = fullTrace[i].replace(/\s+/g, ' ');
 }
 var    caller = fullTrace[1],
 callerParts = caller.split('@'),
 caller = false,
 line = false;

 //CHROME & SAFARI
 if( callerParts.length == 1 ){
 var callerParts = fullTrace[2].split('('), caller = false;
 //we have an object caller
 if( callerParts.length > 1 ){
 caller = callerParts[0].replace('at Object.','');
 line = callerParts[1].split(':');
 line = line[2];
 }
 //called from outside of an object
 else {
 callerParts[0] = callerParts[0].replace('at ','');
 callerParts = callerParts[0].split(':');
 caller = callerParts[0]+callerParts[1];
 line = callerParts[2];
 }
 }
 //FIREFOX
 else {
 var callerParts2 = callerParts[1].split(':');
 line = callerParts2.pop();
 callerParts[1] = callerParts2.join(':');
 var caller = (callerParts[0] == '') ? callerParts[1] : callerParts[0];
 }
 console.log( ' ' );
 console.warn( 'Console log: '+ caller + ' ( line '+ line +' )' );
 console.log( msgOrObj );
 console.log({'Full trace:': fullTrace });
 console.log( ' ' );
 }
 }
 */

/*

 ,
 function( // arguments
 ) {

 // http://stackoverflow.com/questions/1013239/can-i-get-the-name-of-the-currently-running-function-in-javascript
 //var callee = arguments.callee;//.toString().match(/function\s+([^\s\(]+)/)[1];
 var caller = arguments.callee.caller;
 //caller = caller.callee;

 //console.debug('>>>>>>>>>>>>>1',arguments);
 //console.debug('>>>>>>>>>>>>>2',caller);
 //  console.debug('>>>>>>>>>>>>>3',caller2);
 //    console.debug('line:', /\(file:[\w\d/.-]+:([\d]+)/.exec(new Error().stack));

 // http://stackoverflow.com/questions/13610987/javascript-add-extra-argument
 var mainArgs   = Array.prototype.slice.call(arguments);

 // http://stackoverflow.com/questions/7942323/pass-arguments-to-console-log-as-first-class-arguments-via-proxy-function
 if ( typeof(con) !== 'undefined' ) {

 if (caller) {
 /*
 var callerName      = caller.toString().match(/function\s+([^\s\(]+)/);
 callerName = callerName ? callerName[1] : '';
 var callerArguments = caller.arguments;

 // http://stackoverflow.com/questions/13610987/javascript-add-extra-argument
 var callerArgs = Array.prototype.slice.call(callerArguments);

 mainArgs.unshift( '): ');

 // Add quotes to string parameters
 for (var i = callerArgs.length-1; i >= 0; i--) {
 if (typeof callerArgs[i] === 'string') {
 callerArgs[i] = '\'' + callerArgs[i] + '\'';
 }
 mainArgs.unshift(callerArgs[i]);
 if (i !== 0) {
 mainArgs.unshift(',');
 }
 }

 mainArgs.unshift('function ' + callerName + ' (' );
 }
 }
 mainArgs.unshift('*');
 //mainArgs.callee = callee;

 //con.log( mainArgs );
 //con.log.apply( con, mainArgs);
 return mainArgs;
 }
 */



/*
 that.error   = that._debug;
 that.warning = that._debug;
 that.info    = that._debug;
 that.debug   = that._debug;
 that.log     = that._debug;


 return that;
 })();
 */

/**
 * Functions to handle cookies in plain JS
 *
 * http://www.w3schools.com/js/js_cookies.asp
 *
 * @param cname
 * @param cvalue
 * @param exdays
 */
var COOKIE_NEVER_EXPIRES = 20 * 365; // 20 years

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = 'expires=' + d.toGMTString();
  document.cookie = cname + '=' + cvalue + '; ' + expires;
}

function getCookie(cname) {
  var name = cname + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') { c = c.substring(1); }
    if (c.indexOf(name) !== -1) { return c.substring(name.length,c.length); }
  }
  return '';
}

function checkCookie(name, value) {
  var val = getCookie(name);
  if (val === value) {
    return true;
  } else {
    setCookie(name, val, COOKIE_NEVER_EXPIRES);
    return false;
  }
}


/**
 * http://befused.com/javascript/get-filename-url
 *
 * @returns {String}
 */
var getUrlFilename = function() {
  //this gets the full url
  var url = document.location.href;
  //this removes the anchor at the end, if there is one
  url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
  //this removes the query after the file name, if there is one
  url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
  //this removes everything before the last slash in the path
  url = url.substring(url.lastIndexOf("/") + 1, url.length);
  //return
  return url;
};


/***********************************************************************************************************************
 * Change class of element from one to another and backwards
 * like: wrtcSpeakerOn -> wrtcSpeakerOff -> wrtcSpeakerOn ...
 *
 * @param {object} element
 * @param {string} class1
 * @param {string} class2
 */
function elementFlipClass(element, class1, class2) {
  var proto = Object.prototype.toString.call( element),
    isArray = proto === '[object Array]' || proto === '[object HTMLCollection]';
  var elements = isArray ? element : [element];
  for (var len=elements.length, i=0; i<len; ++i) {
    //console.log('len:', len,'; i:',i);
    //console.log('elements[i]:',elements[i]);
    //console.log('elements[i].className:', elements[i].className);

    if ((' ' + elements[i].className + ' ').indexOf(' ' + class1 + ' ') > -1) {
      elements[i].className = (' ' + elements[i].className + ' ').replace(' ' + class1 + ' ', ' ' + class2 + ' ');
    } else {
      elements[i].className = (' ' + elements[i].className + ' ').replace(' ' + class2 + ' ', ' ' + class1 + ' ');
    }
  }
}


var WRTC_CSS_ON  = 'wrtcOn';
var WRTC_CSS_OFF = 'wrtcOff';
/**
 *
 * @param {object||object[]} element
 */
function elementFlipOnOff(element) {
  elementFlipClass(element, WRTC_CSS_ON, WRTC_CSS_OFF);
}

/**
 *
 * @param {object||object[]} element
 */
function elementOn(element) {
  elementSetClass(element, WRTC_CSS_OFF, WRTC_CSS_ON);
}
/**
 *
 * @param {object||object[]} element
 */
function elementOff(element) {
  elementSetClass(element, WRTC_CSS_ON, WRTC_CSS_OFF);
}

function elementSetOnOff(element, isOn) {
  if (isOn) {
    elementOn(element);
  } else {
    elementOff(element);
  }
}

/**
 * Set element class to some value (also remove if for element set, let's say, inverse class)
 * Like: wrtcEnabled -> wrtcDisabled
 *
 * @param {object||object[]} element
 * @param {string} classExisting
 * @param {string} classFinal
 */
function elementSetClass(element, classExisting, classFinal) {
  /** http://stackoverflow.com/questions/5898656/test-if-an-element-contains-a-class
   * Using indexOf is correct, but you have to tweak it a little:
   * Otherwise you will also get true if the class you are looking for is part of another class name.
   */
  var proto = Object.prototype.toString.call( element),
    isArray = proto === '[object Array]' || proto === '[object HTMLCollection]';
  var elements = isArray ? element : [element];
  for (var len=elements.length, i=0; i<len; ++i) {

    if ((' ' + elements[i].className + ' ').indexOf(' ' + classExisting + ' ') > -1) {
      elementFlipClass(elements[i], classExisting, classFinal);
    } else if ((' ' + elements[i].className + ' ').indexOf(' ' + classFinal + ' ') === -1) {
      elements[i].className += ' ' + classFinal;
    } else {
      /** Do nothing as final class is already here **/
    }

  }
}

var CSS_DISABLED = 'wrtcDisabled';
var CSS_ENABLED  = 'wrtcEnabled';
/**
 * Set element class to wrtcDisabled (also remove wrtcEnabled if set)
 * and remove onclick handler
 */
function elementDisable(element) {
  elementSetClass(element, CSS_ENABLED, CSS_DISABLED);
  element.onclick = null;
}


var CSS_HIDDEN  = 'wrtcHidden';
var CSS_VISIBLE = 'wrtcVisible';
/**
 * Set element class to wrtcHidden (also remove wrtcVisible if set)
 * and remove onclick handler
 */
function elementHide(element) {
  elementSetClass(element, CSS_VISIBLE, CSS_HIDDEN);
}

function elementFlipHidden(element) {
  elementFlipClass(element, CSS_VISIBLE, CSS_HIDDEN);
}


/***********************************************************************************************************************
 *  Simple way to check if browser has minimal supports for WebRTC (check existence of getUserMedia function)
 *
 * @returns {boolean}
 */
function isWebRTCCompatible() {
  return !! (
    (typeof getUserMedia !== 'undefined') // To avoid message 'SCRIPT5009: 'getUserMedia' is undefined'
    && getUserMedia
  );
}

/***********************************************************************************************************************
 * Get length of associative Array
 * http://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array
 *
 * @param obj
 * @returns {number}
 */

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) { size++; }
  }
  return size;
};
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// http://stackoverflow.com/questions/152483/is-there-a-way-to-print-all-methods-of-an-object-in-javascript
// Using it:
//    console.log(getMethods(document).join('\n'));
//
function getMethods(obj) {
  var result = [];
  for (var id in obj) {
    try {
      if (typeof(obj[id]) == 'function') {
        result.push(id + ': ' + obj[id].toString());
      }
    } catch (err) {
      result.push(id + ': inaccessible');
    }
  }
  return result;
}
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Extract parameters from page URL
//
function getURLParameter(name) {
  var re = new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)');
  return decodeURIComponent((re.exec(location.search)||[,''])[1].replace(/\+/g, '%20')) || null;
}
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
//
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
//

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generates random char+numbers id in the form 'ebfj1jmi7'
var STR_ID_LENGTH = 9;

function genStrId() {
  var res = '';
  do {
    // generate a random number and convert it to base 36 (0-9a-z):
    res += Math.random().toString(36).substr(2, STR_ID_LENGTH); // remove `0.`
  } while (res.length < STR_ID_LENGTH);
  if (res.length > STR_ID_LENGTH) {
    res = res.substr(1, STR_ID_LENGTH);
  }
  return res;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var NUM_ID_LENGTH = 5;

// Simplest way to pad number with leading zeroes
function pad(num, len) {
  var s = num + '';
  while (s.length < len) s = '0' + s;
  return s;
}

function genNumId() {
  var r = Math.floor(( Math.random()* Math.pow(10, NUM_ID_LENGTH) )+1);
  // another solution:
  // Math.random().toString().substr(2)
  // then substring to needed number of symbols
  return pad(r, NUM_ID_LENGTH);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * http://stackoverflow.com/questions/5916900/detect-version-of-browser
 *
 * @returns {*} -- 'MSIE' / 'Chrome' / 'Firefox'
 */
function get_browser(){
  var
    ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    //return 'IE '+(tem[1]||'');
    return 'MSIE';
  }
  if(M[1] === 'Chrome'){
    tem = ua.match(/\bOPR\/(\d+)/)
    if(tem != null)   { return 'Opera '+tem[1]; }
  }
  M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null ) { M.splice(1,1,tem[1]); }
  return M[0];
}
/**
 * http://stackoverflow.com/questions/5916900/detect-version-of-browser
 *
 * @returns {*} -- Value is major version number like: 10 (MSIE) / 34 (Chrome) / 30 (Firefox)
 */
function get_browser_version(){
  var
    ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    //return 'IE '+(tem[1]||'');
    return /*'IE '+*/ (tem[1]||'');
  }
  if(M[1] === 'Chrome'){
    tem = ua.match(/\bOPR\/(\d+)/)
    if(tem!=null)   {return 'Opera '+tem[1];}
  }
  M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1,1,tem[1]); }
  return M[1];
}
//

/**
 * Check Temasys plugin and get its version
 *
 * @returns {version|*|version|version|version|version}
 */
function get_temasys_version() {
  var version;
  if (typeof Temasys !== 'undefined') {
    // Version 0.8.794 and later
    version = (typeof Temasys !== 'undefined') && Temasys.WebRTCPlugin && Temasys.WebRTCPlugin.TemRTCPlugin && Temasys.WebRTCPlugin.TemRTCPlugin.version;
  } else {
    // Version 0.8.770 and earlier
    version = (typeof plugin !== 'undefined') && plugin() && plugin().version;
  }
  return version;
}

function set_temasys_debug(debugLevel) {
  var p;
  if ( (typeof Temasys !== 'undefined') && Temasys.WebRTCPlugin && Temasys.WebRTCPlugin.TemRTCPlugin ) {
    // Version 0.8.794 and later
    p = Temasys.WebRTCPlugin.TemRTCPlugin;
    p.setLogFunction(debug);
    p.setLogLevel(debugLevel);
  } else if ( (typeof plugin !== 'undefined') && plugin() ) {
    // Version 0.8.770 and earlier
    p = plugin();
    p.setLogFunction(debug);
    p.setLogLevel(CONFIG.TEMASYS.DEBUG_LEVEL);
  } else {
    debug.error('set_temasys_debug(): unable to access plugin');
  }

}
//

if (isClient())  {
  debug.info('get_browser:', get_browser(), '; get_version:', get_browser_version());
  var v = get_temasys_version();
  debug.info('get_temasys_version():', v ? v : 'Not installed.');
}
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// http://stackoverflow.com/questions/287903/enums-in-javascript
/*
 function Enum() {
 var that = this;
 for (var i in arguments) {
 that[arguments[i]] = i;
 }
 this.name = function(value) {
 for (var key in that) {
 if (that[key] == value) {
 return key;
 }
 }
 };
 this.exist = function(value) {
 return (typeof that.name(value) !== 'undefined');
 };
 if (Object.freeze) {
 Object.freeze(that);
 }
 }
 Object.defineProperty(Object.prototype,'Enum', {
 value: function() {
 for(i in arguments) {
 Object.defineProperty(this,arguments[i], {
 value:parseInt(i),
 writable:false,
 enumerable:true,
 configurable:true
 });
 }
 return this;
 },
 writable:false,
 enumerable:false,
 configurable:false
 });
 */

/*Object.prototype.toEnum = function() {
 var that = {};

 for (var prop in this) {
 if (that.hasOwnProperty(prop) && that[prop] === value) {
 that[prop] = this[prop];
 }
 }
 that.getByValue = function(value) {
 for (var prop in that) {
 if (that.hasOwnProperty(prop) && that[prop] === value) {
 return prop;
 }
 }
 return null;
 };

 that.exist = function(value) {
 return that.getByValue(value);
 };

 if (Object.freeze) {
 Object.freeze(that);
 }

 return that;
 };*/

var Enum = function( obj ) {

  obj.getByValue = function(value) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && obj[prop] === value) {
        return prop;
      }
    }
    return null;
  };

  obj._propExists = function(propName) {
    return !! obj[propName];
  };

  obj.valueExists = function(valueName) {
    return !! obj.getByValue(valueName);
  };

  obj.exist = function(valueName) {
    debug.warn('Enum.exist() - deprecated.');

    return obj.valueExists(valueName);
  };

  obj.check = function(valueName) {
    assert(obj.valueExists(valueName), 'ERROR: Enum '+JSON.stringify(obj)+' does not have property value \''+valueName+'\'');
  };

  obj = Const(obj);

  return obj;
};

var Const = function(obj) {
  if (Object.freeze) {
    Object.freeze(obj);
  }
  return obj;
};

/**
 *
 * @param element                 - HTML Element
 * @param {string} eventName      - Event name
 * @param {function} eventHandler - Event handler
 */
function addEvent(element, eventName, eventHandler) {
  //debug.log('addEvent(): element:', element);
  assert(element && eventName && ( (typeof eventHandler === "function") || eventHandler === null),
    'addEvent: Invalid parameters: element:'+element+'; eventName:'+eventName+'; eventHandler: '+eventHandler);
  /** Unify event name ('onload' -> 'load')
   * Suggesting that it is not possible to have eventName like 'onon...' **/
  if (eventName.slice(0, 2) === 'on') {
    eventName = eventName.slice(2);
  }
  /** Add event handler to the object **/
  if (element.addEventListener) {    /** W3C standard **/
    // debug.log('addEvent(): element:', element, '; eventName: \'' + eventName);// + '\'; handler:', handler);

  element.addEventListener(eventName, eventHandler, false); /** NB **not** 'onload' **/
  } else if (element.attachEvent) {  /** Microsoft **/
  element.attachEvent('on' + eventName, eventHandler);
  } else {
    debug.warn('The browser does not support Javascript event binding');
    if ( element['on' + eventName] !== undefined) { /** Last chance **/
    element['on' + eventName] = eventHandler
    }
  }
}

/**
 * Add event to HTML Element By its Id
 *
 * @param {string} elementId
 * @param {string} eventName
 * @param {function} eventHandler
 */
function addEventById(elementId, eventName, eventHandler) {
  var obj = document.getElementById(elementId);
  if (obj) {
    addEvent (obj, eventName, eventHandler);
  } else {
    debug.warn('addEventByClass(): Element with Id: \''+elementId+'\' not found.');
  }
}

/**
 * Add event to HTML Element By its Class
 *
 * @param {Object} parent         - HTML Element
 * @param {string} className      - Class of elements to add event
 * @param {string} eventName      - Name of the event
 * @param {function} eventHandler - Event handler
 */
function addEventByClass(parent, className, eventName, eventHandler) {
  if (!parent) { debug.error('addEventByClass(): empty parent.'); }
  var elements = parent.getElementsByClassName(className);
  //debug.log('addEventByClass(): elements:', elements);
  if (elements.length !== 0) {
    for (var i = 0; i < elements.length; i++) {
      addEvent (elements[i], eventName, eventHandler);
    }
  } else {
    debug.warn('addEventByClass(): Elements with class: \''+className+'\' not found.');
  }
}


/**
 * Set options (like style, disabled etc) for specified objects (by id)
 *
 * @todo Add option to set by elementClass, elementType or elementId
 *
 * Example of structure:
 * ---------------------
 * NORMAL: {
 *   'button1' : { style: { visibility: 'visible' } },
 *   'button2' : { style: { display:    'inline'  } }
 * }, IE: {
 *   'button1' : { disabled : false }
 * }
 *
 * @param {object} stateDefs
 */
function setStates(stateDefs) {

  /**
   * Iterate recursively through all the properties of the definition and assign to target object
   *
   * @param {object} base
   * @param {object} from
   * @param {string} debugElementId
   */
  function assignRecursively(base, from, debugElementId) {
    // debug.log('setStates(): assignRecursively(1): base:', base, '; from:', from);
    for (var p1 in from) {
      // debug.log('setStates(): assignRecursively(2): p1:', p1, '; base[p1]:', base[p1], '; from[p1]:', from[p1]);
      if (from.hasOwnProperty(p1)) {
        // debug.log('setStates(): assignRecursively(3): p1:', p1, '; base[p1]:', base[p1], '; from[p1]:', from[p1]);
        if ( typeof from[p1] === "object") {
          // debug.log('setStates(): assignRecursively(4): assignRecursively');
          assignRecursively (base[p1], from[p1]); /** Going deeper **/
        } else {
          //          debug.log('setStates(): assignRecursively(5): assignment:',
          //            base, '[', p1, ']=', base[p1],
          //            '; ', from, '[', p1, ']=', from[p1]);
          //          if (!base) throw('Invalid base for ElementId: ', debugElementId, '; base: ', base);
          //          if (!from) throw('Invalid from for ElementId: ', debugElementId, '; from: ', from);
          base[p1] = from[p1];          /** End of branch **/
        }
      }
    }
  }

  /**
   * Set states for one specific definition (i.e. 'NORMAL' or 'IE')
   *
   * @param {object} stateSubDefs
   */
  function setStates1(stateSubDefs) {
    for ( var elementId in stateSubDefs ) { /** iterate through all the button element ids       **/
      //debug.log('setStates(): elementId:', elementId);
      if ( stateSubDefs.hasOwnProperty(elementId) ) {  /** check if it is not inherited property **/
      var element      = document.getElementById(elementId); /** get document's HTML element       **/
        if (!element) { debug.warn('Invalid Element, elementId:', elementId); }
        else {
          var elementProps = stateSubDefs[elementId];
          //        debug.log('setStates(): elementId:', elementId, /*'; element:', element,*/ '; elementProps:', JSON.stringify(elementProps));
          assignRecursively(element, elementProps, elementId);
          //      debug.log('setStates(): element.style.visibility:', element.style.visibility);
        }
      }
    }
  }

  debug.log('setStates()');
  setStates1(stateDefs.NORMAL);     /** Set normal states for elements             **/
  if ( get_browser() === 'MSIE' ) { /** ...but if browser is IE                    **/
  setStates1(stateDefs.IE);       /** ...then override with IE specific settings **/
  }
}

/**
 * http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
 *
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateName(value) {
  var re = /./;
  return re.test(value);
}



var WRTCObject = function() {
  this.debug = _debug(this);

  WRTCObject.prototype.log   = this.debug.log; // function(/*arguments*/) { console.log(arguments) };
  WRTCObject.prototype.debug = this.debug.debug;
  WRTCObject.prototype.info  = this.debug.info;
  WRTCObject.prototype.warn  = this.debug.warn;
  WRTCObject.prototype.error = this.debug.error;

  return this;
};

//WRTCObject.inherits(Object);


// String Format function for String.prototype
//
// Example:
//    "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
// outputs
//    ASP is dead, but ASP.NET is alive! ASP {2}
//
// Taken from: http://stackoverflow.com/a/4673436/2774010

if (!String.prototype.format) { // First, checks if it isn't implemented yet.
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
  };
}

if (!String.prototype.formatObj) { // First, checks if it isn't implemented yet.
  String.prototype.formatObj = function(hash) {
    return this.replace(/{(\w+)}/g, function(match, number) {
      console.log('String.prototype.formatObj(): match:', match);
      var prop = match.substr(1, match.length-2); // remove '{' and '}'
      return typeof hash[prop] != 'undefined'
        ? hash[prop]
        : match  // Leave unchanged
        ;
    });
  };
}



function loadTemplates( templates ) {
  _.templateSettings = {
    escape:      /<\?-(.+?)\?>/g,
    evaluate:    /<\?(.+?)\?>/g,
    interpolate: /<\?=(.+?)\?>/g
  };
  for (var name in templates) {
    if (templates.hasOwnProperty(name)) {
      var tmp = templates[name];
      tmp.element = document.getElementById(tmp.id);
      if (!tmp.element) { throw 'loadTemplates(): template not found: name: ' + name +'; id: ' + id; }
      tmp.template = tmp.element.innerHTML;
      //debug.log(tmp.template);
      tmp.compiled = _.template(tmp.template);
    }
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (typeof module !== 'undefined') {
  module.exports = {debug: debug};
}


},{}],3:[function(require,module,exports){
/**
 * Created by alykoshin on 9/9/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var Emitter = require('./../../mylib/emitter.js');
}

/**
 * Low-level wrapper for RTCPeerConnection
 *
 * @class __RTCPeerConnection
 * @constructor
 * @returns {__RTCPeerConnection}
 * private
 */

var __RTCPeerConnection = function() {
  var self = new WRTCObject();
  Emitter(self);

  /**
   * @name rtcPeerConnection
   * @memberOf __RTCPeerConnection
   * @type {RTCPeerConnection}
   * private
   */
  var rtcPeerConnection = null;

  /**
   * @name rtcPeerConnection
   * @memberOf __RTCPeerConnection
   * @type {RTCPeerConnection}
   * @readOnly
   */
  Object.defineProperty(self, 'rtcPeerConnection', {
    get: function () {
      return rtcPeerConnection;
    }
  });

  /**
   * @name signalingState
   * @memberOf __RTCPeerConnection
   * @type {RTCSignalingState}
   * @readOnly
   */
  Object.defineProperty(self, 'signalingState', {
    /** @returns {RTCSignalingState} */
    get:
      function () {
        return rtcPeerConnection ? rtcPeerConnection.signalingState : null;
      }
  });

  /**
   * @name iceConnectionState
   * @memberOf __RTCPeerConnection
   * @type {RTCIceConnectionState}
   * @readOnly
   */
  Object.defineProperty(self, 'iceConnectionState', {
    /** @returns {RTCIceConnectionState} */
    get: function () {
      return rtcPeerConnection ? rtcPeerConnection.iceConnectionState : null;
    }
  });

  /**
   * @name iceConnectionState
   * @memberOf __RTCPeerConnection
   * @type {RTCIceGatheringState}
   * @readOnly
   */
  Object.defineProperty(self, 'iceGatheringState', {
    /** @returns {RTCIceGatheringState} */
    get: function () {
      return rtcPeerConnection ? rtcPeerConnection.iceGatheringState : null;
    }
  });

  /**
   *
   * @param rtcConfiguration
   */
  self._createPeerConnection = function(rtcConfiguration) {

    // Create the WebRTC object RTCConnection

    debug.log('__RTCPeerConnection._createPeerConnection(): rtcConfiguration:' + JSON.stringify(rtcConfiguration, null, 2));
    rtcPeerConnection = new RTCPeerConnection(rtcConfiguration);

    // Set RTCConnection events

    /**
     * @type RTCPeerConnection#onaddstream
     * @fires _addstream
     */
    rtcPeerConnection.onaddstream = function(ev) {
      self.emit('_addstream',    ev);
    };

    /**
     * @type RTCPeerConnection#ondatachannel
     * @fires _datachannel
     */
    rtcPeerConnection.ondatachannel = function(ev) {
      self.emit('_datachannel',  ev);
    };

    /**
     * @type RTCPeerConnection#onicecandidate
     * @fires _icecandidate
     */
    rtcPeerConnection.onicecandidate = function(ev) {
      self.emit('_icecandidate', ev);
    };

    /**
     * @type RTCPeerConnection#oniceconnectionstatechange
     * @fires _iceconnectionstatechange
     */
    rtcPeerConnection.oniceconnectionstatechange = function(ev) {
      // It's better not to access self object as during destruction it may be already null
      debug.log('rtcPeerConnection.oniceconnectionstatechange()' +
        '; iceConnectionState:', ev.target.iceConnectionState,
        '; iceGatheringState:',  ev.target.iceGatheringState,
        '; ev:', ev);
      self.emit('_iceconnectionstatechange', ev);
    };

    /**
     * @type RTCPeerConnection#onnegotiationneeded
     * @fires _negotiationneeded
     */
    rtcPeerConnection.onnegotiationneeded = function(ev) {
      self.emit('_negotiationneeded', ev);
    };

    /**
     * @type RTCPeerConnection#onremovestream
     * @fires _removestream
     */
    rtcPeerConnection.onremovestream = function(ev) {
      self.emit('_removestream', ev);
    };

    /**
     * @type RTCPeerConnection#onsignalingstatechange
     * @fires _signalingstatechange
     */
    rtcPeerConnection.onsignalingstatechange = function(ev) {
      // It's better not to access self object as during destruction it may be already null
      debug.log('rtcPeerConnection.onsignalingstatechange()' +
        ': signalingState:', ev.target.signalingState,
        '; ev:', ev);
      self.emit('_signalingstatechange', ev);
    };

  };

  /**
   * Cleanup - close rtcPeerConnection and set it to null
   *
   * @memberOf _RTCPeerConnection
   */

  self.cleanup = function() {
    debug.log('_RTCPeerConnection.cleanup()');
    self.emit('close', self);
    rtcPeerConnection.close();  // Close connection RTCPeerConnection
    rtcPeerConnection = null;   // Remove reference to it
  };

  /**
   *
   * @param localDescription
   * @private
   */
  self._createOfferSuccess = function(localDescription) {
    //debug.log('__RTCPeerConnection._createOfferSuccess: localDescription:', localDescription);
    self.emit('_createOfferSuccess', localDescription);
  };

  /**
   *
   * @param error
   * @private
   */
  self._createOfferError = function(error) {
    //debug.log('__RTCPeerConnection._createOfferError: error:', error);
    self.emit('_createOfferError',   error);
  };

  /**
   *
   * @param {RTCOfferConstraints} constraints
   * @fires _offerSuccess
   * @fires _offerError
   */
  self._createOffer = function(constraints) {
    self.emit('_createOffer', constraints);
    rtcPeerConnection.createOffer( self._createOfferSuccess, self._createOfferError, constraints);
  };

  /**
   *
   * @param localDescription
   * @fires _createAnswerSuccess
   * @private
   */
  self._createAnswerSuccess = function(localDescription) {
    self.emit('_createAnswerSuccess', localDescription);
  };

  /**
   *
   * @param error
   * @fires _createAnswerError
   * @private
   */
  self._createAnswerError = function(error) {
    self.emit('_createAnswerError', error);
  };

  /**
   *
   * @param {RTCOfferConstraints} constraints
   * @fires _answerSuccess
   * @fires _answerError
   */
  self._createAnswer = function(constraints) {
    self.emit('_createAnswer', constraints);
    rtcPeerConnection.createAnswer( self._createAnswerSuccess, self._createAnswerError, constraints);
  };

  /**
   * @method _addLocalStream
   * @memberOf __RTCPeerConnection
   * @param {MediaStream} stream
   * @fires _addLocalStream - BEFORE calling RTCPeerConnection.addStream
   */
  self._addLocalStream = function (stream) {
    self.emit('_addLocalStream', stream);
    rtcPeerConnection.addStream( stream );
  };
  self.on('_addLocalStream',  function(ev) { debug.log('__RTCPeerConnection._addLocalStream(): ev:', ev); } );

  /**
   * @memberOf __RTCPeerConnection
   * @param {RTCSessionDescription} localDescription
   * @fires _setLocalDescription - BEFORE calling RTCPeerConnection.setLocalDescription
   */
  self._setLocalDescription = function(localDescription) {
    self.emit('_setLocalDescription', localDescription);
    self.rtcPeerConnection.setLocalDescription(localDescription);
  };
  self.on('_setLocalDescription',  function(ev) { debug.log('__RTCPeerConnection.on(): _setLocalDescription(): ev:', ev); } );

  /**
   * @memberOf __RTCPeerConnection
   * @param {RTCSessionDescription} remoteDescription
   * @fires _setRemoteDescription - BEFORE calling RTCPeerConnection.setRemoteDescription
   */
  self._setRemoteDescription = function(remoteDescription) {
    self.emit('_setRemoteDescription', remoteDescription);
    self.rtcPeerConnection.setRemoteDescription( new RTCSessionDescription(remoteDescription) );
  };

  return self;
};


var _RTCPeerConnection = function ( rtcConfiguration ) {
  var self = new __RTCPeerConnection();
  self._createPeerConnection(rtcConfiguration);

  /*
   * 4.2.4 Offer/Answer Options
   * These dictionaries describe the options that can be used to control the offer/answer creation process.
   * dictionary RTCOfferOptions {
   *  long    offerToReceiveVideo;
   *  long    offerToReceiveAudio;
   *  boolean voiceActivityDetection = true;
   *  boolean iceRestart = false;
   * };
   */

  /* Answer/Offer Constraints
   * More info: http://dev.w3.org/2011/webrtc/editor/webrtc.html#idl-def-RTCOfferOptions
   */
    // Can be left empty - session is still ok (at least two-way video)
  /**
   * @type {RTCOfferConstraints}
   */
  self.OFFER_ANSWER_CONSTRAINTS = {
    mandatory: {
      OfferToReceiveVideo: true,
      OfferToReceiveAudio: true
    }
  };
  /**
   * @type {RTCOfferConstraints}
   */
  self.offerConstraints  = _.clone(self.OFFER_ANSWER_CONSTRAINTS);
  /**
   * @type {RTCOfferConstraints}
   */
  self.answerConstraints = _.clone(self.OFFER_ANSWER_CONSTRAINTS);

  /**
   * Create offer
   *
   * @memberOf _RTCPeerConnection
   */
  self.createOffer = function() {
    self._createOffer(self.offerConstraints);
  };

  /**
   * Create answer
   *
   * @memberOf _RTCPeerConnection
   */
  self.createAnswer = function() {
    self._createAnswer( self.answerConstraints );
  };

  /**
   * @method addLocalStream
   * @memberOf _RTCPeerConnection
   * @param {MediaStreamController} mediaStream
   */
  self.addLocalStream = function (mediaStream) {
    self._addLocalStream( mediaStream.stream );
  };

  return self;
};


if (typeof module !== 'undefined') {
  //module.exports = __RTCPeerConnection;
  module.exports = _RTCPeerConnection;
}

if (typeof window !== 'undefined') {
  window._RTCPeerConnection  = _RTCPeerConnection;
}

},{"./../../mylib/emitter.js":1,"./../../mylib/utils.js":2}],4:[function(require,module,exports){
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

},{"./../../mylib/utils.js":2,"./wrtcPeerConnection.js":7}],5:[function(require,module,exports){
/**
 * Created by alykoshin on 3/21/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var Connection = require('./connection.js');
}

/**
 *    local endpoints              remote endpoints
 * /-------------------\         /-------------------\
 *
 *           /---connId1 - - - - connId1---\
 *           |                             +---userId2
 *           +---connId2 - - - - connId2---/
 * userId1---+
 *           +-- connId3 - - - - connId3---\
 *           |                             +---userId3
 *           \-- connId4 - - - - connId4---/
 *
 * [                     <-- [invite]   ]
 *   hello / helloScreen -->
 *                       <-- offer / offerScreen
 *   answer/answerScreen -->
 *                       <-- ice
 *                   ice -->
 *
 */

'use strict';

var peerConnections = (function() {
  var that = {};

  Emitter(that);

  /**
   * Active connections array
   * @type {{}}
   */
  var pcs = {};

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /** Создание объекта RTCPeerConnection
   * Непосредственно при создании RTCPeerConnection добавим к нему
   * локальный медиа-поток, создадим HTML видео-элемент,
   * зададим объявленные выше обработчики событий onicecandidate и onaddstream
   * и добавим в массив соединений
   *
   * @param mediaType
   * @param direction
   * @param {string} connId
   * @param localMedia
   * @param {ConnectionUser} localUserObj
   * @param {ConnectionUser} remoteUserObj
   * @returns {Connection}
   */
  that.add = function(mediaType, direction, connId, localMedia, localUserObj, remoteUserObj) {

    /**
     * При получении нового ICE-кандидата просто отправим его другому участнику соединения.
     *
     * @param {RTCIceCandidate} cand
     */
    function onIceCandidate(cand) {
      if (cand) {
        debug.log('pc.onIceCandidate(): cand: \''+ cand.candidate.replace('\r\n', '') +'\'', cand);
        //sendIce(remoteUserObj, connId, cand); // remoteUserId содержит идентификатор дальней стороны
        wrtc.sendEvent(MESSAGES.WEBRTC_ICE, remoteUserObj, connId, cand);
      }
    }

    function onCreateOfferSuccess(ldesc) {
      var action;
      if (mediaType === MEDIA_TYPE.VIDEO) {
        action = MESSAGES.WEBRTC_OFFER;
      } else {
        action = MESSAGES.WEBRTC_OFFER_SCREEN;
      }

      //sendOffer(action, remoteUserObj, connId, localUserObj, ldesc);
      wrtc.sendEvent(action, remoteUserObj, connId, ldesc);

      var conn = pcs[connId];
      conn.addIceBuffer(iceBuffer, connId);

      debug.info('Offer sent. Waiting for the answer from remote...');
    }

    function onCreateError(error) {
      debug.error('onCreateError(): error:', error);
      messageWrtc('Connection error',
        'Error during establishing connection',
        'peerConnections.offer/answer()',
        error);
    }

    function onCreateAnswerSuccess(ldesc) {
      debug.log('peerConnections.answer(): success(); sdp: \n'+ldesc.sdp+' ldesc: ', ldesc);
      //sendAnswer(MESSAGES.WEBRTC_ANSWER, remoteUserObj, connId, localUserObj, ldesc);
      wrtc.sendEvent(MESSAGES.WEBRTC_ANSWER, remoteUserObj, connId, ldesc);
      var conn = pcs[connId];
      conn.addIceBuffer(iceBuffer, connId);
      debug.info('Answer sent. Waiting for the media from remote...');
    }


    debug.log('peerConnections.add(): mediaType:', mediaType, '; direction:', direction,
      '; remoteUserObj:', remoteUserObj, '; connId:', connId, '; localMedia:', localMedia);

    MEDIA_TYPE.check(mediaType);

    var c = new Connection( {
      rtcConfiguration: rtcConfiguration,
      bandwidth       : option_bw,
      mediaType       : mediaType,
      connId          : connId   // Connection ID is known after Offer/Answer handshake
      //      onIceCandidate:   onIceCandidate,
      //      onOfferSuccess:   onOfferSuccess,
      //      onOfferError:     onOfferError,
      //      onAnswerSuccess:  onAnswerSuccess,
      //      onAnswerError:    onAnswerError
    } );

    c.onCreateOfferSuccess  = onCreateOfferSuccess;
    c.onCreateOfferError    = onCreateError;
    c.onCreateAnswerSuccess = onCreateAnswerSuccess;
    c.onCreateAnswerError   = onCreateError;
    c.onIceCandidate        = onIceCandidate;

    c._media_was_connected = false;

    c.on('iceConnectionStateChange', function(iceConnectionState, iceGatheringState) {
      /*
       * enum RTCIceConnectionState {
       *   "new",
       *   "checking",
       *   "connected",
       *   "completed",
       *   "failed",
       *   "disconnected",
       *   "closed"
       * };
       *
       * enum RTCIceGatheringState {
       *   "new",
       *   "gathering",
       *   "complete"
       * };
       */
      that.emit('iceConnectionStateChange', c, iceConnectionState, iceGatheringState);

      if (iceConnectionState === 'connected' ) { // Connection was established
        that.emit('media_connect', c);

        if (!c._media_was_connected) {
          c._media_was_connected = true;
          that.emit('media_start', c);
        } else {
          that.emit('media_continue', c);
        }

      } else if (iceConnectionState === 'disconnected') { // Media connection was lost
        that.emit('media_stop', c);

      } else if (iceConnectionState === 'failed') {       // We were not able to establish connection
        that.emit('media_fail', c);
      }

    });

    c.on('close', function(conn) { that.emit('close', conn); });

    /** @type {ConnectionUser} */
    c.localUser  = localUserObj;
    /** @type {ConnectionUser} */
    c.remoteUser = remoteUserObj;

    if (direction.forward) {
      if (localMedia && localMedia.stream) {
        debug.log('peerConnections.add(): Adding localMedia', localMedia);
        c.addLocalStream(localMedia.stream);       // Add local stream to the connection
        c.lvid = localMedia.vid;
        // debug.log( 'peerConnections.add(): pc.getLocalStreams():', c.peerConnection.getLocalStreams() );
      } else {
        debug.warn('peerConnections.add(): no localMedia');
      }
    } else {
      c.lvid = null;
    }

    if (direction.backward) {
      c.rvid = remoteVideos.add(mediaType, connId);

      c.showUserInfo(  ); // remoteUserObj.name );
    } else {
      c.rvid = null;
    }

    pcs[connId] = c;
    return c;
  };


  function addIceBuffer(connId) {
    var c = pcs[connId];
    c.addIceBuffer(iceBuffer, connId);
  }

  that.offer = function(mediaType, offerId, direction, localMedia, localUserObj, remoteUserObj/*, successCb, errorCb*/) {
    var connId, c;
    debug.log('peerConnections.offer(): mediaType', mediaType, '; remoteUserObj.id:', remoteUserObj.id, '; localMedia:', localMedia);
    MEDIA_TYPE.check(mediaType);

    //  Check the number of current videos
    //      if (remoteVideos.count() >= 2) {
    //        debug.log('peerConnections.offer(): Offer ignored: Too many videos already active.');
    //        return;
    //      }

    connId = genStrId();
    c = that.add(mediaType, direction, connId, localMedia, localUserObj, remoteUserObj ); //self.find(remoteUserId); // Find
    //      socket.emit('setConnId', connId); // Set connId for socket from Node.js side to send hangup in the future
    //    that.successCbOffer = successCb;
    c.createOffer();
  };

  that.answer = function(mediaType, direction, connId, localMedia, localUser, remoteUser, rdesc/*, successCb, errorCb*/) {
    var dir, c;
    debug.log('peerConnections.answer(s): mediaType', mediaType, '; remoteUser.id:', remoteUser.id, '; connId:', connId, '; localMedia:', localMedia, '; rdesc:', rdesc);
    MEDIA_TYPE.check(mediaType);

    // for the Answer the direction is opposite
    // (we assume direction is from offer to answer, but now it is backward
    dir = {};
    dir.forward  = direction.backward;
    dir.backward = direction.forward;

    //    debug.log('!!!!!!!!! answer: add>>>');
    c = that.add(mediaType, dir, connId, localMedia, localUser, remoteUser );

    c._setRemoteDescription(rdesc);
    c.createAnswer();
  };

  /**
   *  @typedef {{string}} ConnId
   */

  /**
   * Removal of RTCPeerConnection:
   *
   * @param {ConnId} id
   */
  that.delByConnId = function(id) {
    if ( pcs[id] ) {
      pcs[id].cleanup();
      delete pcs[id];  // ...and remove from associative array
    }
  };

  /**
   *
   * @param {ConnId} id
   * @returns {*}
   */
  that.find = function(id) {
    return pcs[id];
  };

  /**
   *
   * @param {ConnId} id
   * @returns {boolean}
   */
  that.exists = function(id) {
    return !!pcs[id];
  };

  that.addIce = function(connId, ice) {
    var c = that.find(connId);
    debug.log('peerConnections.addIce: connId: ' + connId +'; ice: ' + JSON.stringify(ice) );
    if ( c ) {                      // PeerConnection for this connId is already created
      c.addIceCandidate(ice);       // Passing it to connection object
    } else {                        // PeerConnection for this connId is not yet exists
      iceBuffer.add( connId, ice ); // Storing it to iceBuffer
    }
  };

  that.setRDesc = function(connId, desc) {
    var c = this.find(connId);
    c.setRDesc(desc);
  };

  that.setLDesc = function(id, desc) {
    var c = this.find(id);
    c.setLDesc(desc);
  };

  that.onAnswerReceived = function( connId, remoteUser, desc ) {
    var c = that.find( connId );
    desc.sdp = sdp_sendonly2sednrecv(desc.sdp);
    that.setRDesc(connId, desc);

    // Store remote user information
    c.remoteUser = remoteUser;

    c.showUserInfo();
  };

  // If specific connection set, hangup only this one
  that._hangupLocalEndByConnId = function(connId) {
    debug.log('peerConnections._hangupLocalEndByConnId(): connId:', connId);
    remoteVideos.delByConnId(connId);
    that.delByConnId(connId);
  };

  // 'connId' is not set - Hangup all connections from remote user
  that._hangupLocalEndByUserId = function(remoteUserId) {
    for ( var id in pcs ) {   // Iterate through each PeerConnection
      debug.log('peerConnections._hangupLocalEnd(): iterating: remoteUserId:', remoteUserId);
      if ( pcs.hasOwnProperty(id) && pcs[id].remoteUser.id === remoteUserId ) { //
        debug.log('peerConnections._hangupLocalEnd(): found: remoteUserId:', remoteUserId);
        remoteVideos.delByConnId( id );
        that.delByConnId( id );
      }
    }
  };

  that._hangupLocalEnd = function(remoteUser, connId) {
    debug.log('peerConnections._hangupLocalEnd(): ');
    // If specific connection set, hangup only this one
    // usually it is initiated by local user
    if (connId) { that._hangupLocalEndByConnId(connId); }
    // 'connId' is not set - Hangup all connections from remote user
    // usually it is initiated by server on remote user websocket disconnect
    else { that._hangupLocalEndByUserId(remoteUser.id); }

    that.emit('hangup', 'local', remoteUser);
  };

  that._hangupRemoteEnd = function(remoteUser, connId) {
    debug.log('peerConnections._hangupRemoteEnd(): ');

    wrtc.sendEvent(MESSAGES.HANGUP, remoteUser, connId, null);
    that.emit('hangup', 'remote', remoteUser);
  };

  /**
   * Hangup was received from remote, we need to release local end
   *
   * @param {ConnectionUser} remoteUser
   * @param {ConnId} connId
   */
  that.hangupFromRemote = function(remoteUser, connId) {
    debug.log('peerConnections.hangupFromRemote(): ');

    that._hangupLocalEnd(remoteUser, connId);
    that.emit('hangup', 'remote', remoteUser);
  };

  /**
   * Hangup initiated by local side, need to release local and remote ends
   *
   * @param {ConnectionUser} remoteUser
   * @param {ConnId} connId
   */
  that.hangupFromLocal = function(remoteUser, connId) {
    debug.log('peerConnections.hangupFromLocal(): ');

    that._hangupLocalEnd(remoteUser, connId);
    that._hangupRemoteEnd(remoteUser, connId);
  };

  /**
   *
   */
  that.hangupFromLocalAll = function() {
    var id;
    debug.log('peerConnections.hangupFromLocalAll(): ');
    for ( id in pcs ) {   // will go through all active connections
      if (pcs.hasOwnProperty(id)) {

        that.hangupFromLocal(pcs[id].remoteUser, pcs[id].connId/*, true*/); /** and hangup each of them **/
      }
    }
  };

  /** iterate through all connections
   * and hangup all with
   * - localMediaIndex: "2"
   * - or:  mediaIndex: "2"
   * - mediaType: "VIDEO"
   *
   * @param mediaType
   * @param mediaIndex
   */
  that.hangupFromLocalByMedia = function(mediaType, mediaIndex) {
    var pc, id;
    debug.log('peerConnections.hangupFromLocalByMedia(): mediaType:', mediaType, '; mediaIndex:', mediaIndex);
    for ( id in pcs ) {   /** will go through all active connections **/
      if (pcs.hasOwnProperty(id)) {
        pc = pcs[id];
        if (pc.lvid) {
          debug.log('peerConnections.hangupFromLocalByMedia(): pc.lvid: ', pc.lvid);
          debug.log('peerConnections.hangupFromLocalByMedia(): pc.lvid.mediaType:', pc.lvid.mediaType, '; pc.lvid.mediaIndex:', pc.lvid.mediaIndex);
          if (pc.lvid.mediaType === mediaType && pc.lvid.mediaIndex == mediaIndex) {
            debug.log('peerConnections.hangupFromLocalByMedia(): pc.lvid.mediaType:', pc.lvid.mediaType, '; pc.lvid.mediaIndex:', pc.lvid.mediaIndex);

            that.hangupFromLocal(pc.remoteUser, pc.connId/*, true*/); /** and hangup each of them **/
          }
        }
      }
    }
  };

  /**
   *
   * @returns {number}
   */
  that.count = function() {
    return Object.size(pcs);
  };

  /**
   * To give access to PeerConnection array
   *
   * @returns {{}}
   */
  that.pcs = function() {
    return pcs;
  };

  return that;
}());

if (typeof module !== 'undefined') {
  module.exports = peerConnections;
}

if (typeof window !== 'undefined') {
  window.peerConnections  = peerConnections;
}

},{"./../../mylib/utils.js":2,"./connection.js":4}],6:[function(require,module,exports){
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

},{"./../../mylib/utils.js":2,"./_RTCPeerConnection.js":3}],7:[function(require,module,exports){
/**
 * Created by alykoshin on 9/3/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var LWRTCPeerConnection = require('./lwrtcPeerConnection.js');
}

/**
 * Wrapper for RTCPeerConnection
 *
 * @class WRTCPeerConnection
 * @constructor
 * @param {{
 *   rtcConfiguration: {},
 *   audio_send_codec: String,
 *   audio_receive_codec: String,
 *   STEREO: {boolean},
 *   bandwidth: {string},
 *   BANDWIDTH_VOICE_LOW: number,
 *   BANDWIDTH_VIDEO_LOW: number
 * }} options
 */
var WRTCPeerConnection = function ( options ) {

  /**
   * @type {WRTCPeerConnection}
   * @private
   */
  var self = LWRTCPeerConnection(options.rtcConfiguration);

  /**
   * @memberOf WRTCPeerConnection
   * @type {function}
   */
  self.onIceCandidate = null;

  function preprocessDescription(description) {
    var sdp = description.sdp;
    if (options.STEREO) {
      sdp = addStereo(sdp);
    }


    // options.audio_send_codec = 'PCMA/8000';


    if (options.audio_send_codec) {
      sdp = preferAudioCodec(sdp, options.audio_send_codec);
    }
    sdp = sdp_sendonly2sednrecv(sdp);
    sdp = sdp_recvonly2sednrecv(sdp);
    if (options.bandwidth === BANDWIDTH.LOW) {
      sdp = setBandwidth(sdp, options.BANDWIDTH_VOICE_LOW, options.BANDWIDTH_VIDEO_LOW);
    }
    description.sdp = sdp;
    return description;
  }

  self.on('_setLocalDescription',  preprocessDescription);
  self.on('_setRemoteDescription', preprocessDescription);

  /**
   * @memberOf WRTCPeerConnection
   * @param {RTCSessionDescription} localDescription
   * @private
   */
  self.on('_createOfferSuccess', function(localDescription) {
    self._setLocalDescription(localDescription);
    self.addIceBuffer(iceBuffer);
    if (self.onCreateOfferSuccess) { self.onCreateOfferSuccess(localDescription); }
  });

  /**
   * @memberOf WRTCPeerConnection
   * @param error
   * @private
   */
  self.on('_createOfferError', function(error) {
    debug.error('WRTCPeerConnection.createOffer(): _onOfferError(): ' + errorToString(error));
    if (self.onOfferError) { self.onOfferError(error); }
  });

  /**
   * @memberOf WRTCPeerConnection
   * @param localDescription
   * @private
   */
  self.on('_createAnswerSuccess', function(localDescription) {
    self._setLocalDescription(localDescription);
    self.addIceBuffer(iceBuffer);
    if (self.onCreateAnswerSuccess) { self.onCreateAnswerSuccess(localDescription); }
  });

  /**
   * @memberOf WRTCPeerConnection
   * @param error
   * @private
   */
  self.on('_createAnswerError', function(error) {
    debug.error('WRTCPeerConnection.createAnswer(): onAnswerError(): ' + errorToString(error));
    if (self.onCreateAnswerError) { self.onCreateAnswerError(error); }
  });

  return self;

};

if (typeof module !== 'undefined') {
  module.exports = WRTCPeerConnection;
}

if (typeof window !== 'undefined') {
  window.WRTCPeerConnection = WRTCPeerConnection;
}

},{"./../../mylib/utils.js":2,"./lwrtcPeerConnection.js":6}],8:[function(require,module,exports){
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

},{"./../../mylib/utils.js":2}],9:[function(require,module,exports){
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

},{"./../../mylib/utils.js":2,"./basicContainer.js":8}],10:[function(require,module,exports){
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

},{"./../../mylib/utils.js":2,"./basicContainer.js":8}],11:[function(require,module,exports){
/**
 * Created by alykoshin on 9/23/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
}

// todo: need to check exact chrome browser because opera/node-webkit also uses chromium framework
var isChrome = !!navigator.webkitGetUserMedia;

// DetectRTC.js - github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
// Below code is taken from RTCMultiConnection-v1.8.js (http://www.rtcmulticonnection.org/changes-log/#v1.8)
var DetectRTC = {};

(function () {
  var screenCallback;

  var MSG_GET_SOURCE_ID = 'get-sourceId';
  var MSG_ARE_YOU_THERE = 'are-you-there';
  var MSG_EXT_LOADED    = 'rtcmulticonnection-extension-loaded';

  DetectRTC.screen = {

    chromeMediaSource: 'screen',

    getSourceId: function (callback) {
      if (!callback) { throw 'DetectRTC.screen.getSourceId(): "callback" parameter is mandatory.'; }
      screenCallback = callback;
      window.postMessage(MSG_GET_SOURCE_ID, '*');
      console.log('DetectRTC.screen.isChromeExtensionAvailable(): window.postMessage(\' '+MSG_GET_SOURCE_ID+' \', \'*\')');
    },

    isChromeExtensionAvailable: function (callback) {
      // if (!callback) { return; }

      if (DetectRTC.screen.chromeMediaSource === 'desktop') {
        console.log('DetectRTC.screen.isChromeExtensionAvailable(): DetectRTC.screen.chromeMediaSource === \'desktop\', callback(true);');
        if (callback) { callback(true); }
      }

      // ask extension if it is available
      window.postMessage(MSG_ARE_YOU_THERE, '*');
      console.log('DetectRTC.screen.isChromeExtensionAvailable(): window.postMessage(\''+MSG_ARE_YOU_THERE+'\', \'*\')');

      setTimeout(function () {
        if (DetectRTC.screen.chromeMediaSource === 'screen') {
          console.log('DetectRTC.screen.isChromeExtensionAvailable(): DetectRTC.screen.chromeMediaSource === \'screen\', callback(false);');
          if (callback) { callback(false); }
        } else {
          console.log('DetectRTC.screen.isChromeExtensionAvailable(): DetectRTC.screen.chromeMediaSource !== \'screen\', callback(true);');
          if (callback) { callback(true); }
        }
      }, 2000);
    },

    onMessageCallback: function (data) {
      console.log('DetectRTC.screen.onMessageCallback(): data:', data);

      // "cancel" button is clicked
      if (data == 'PermissionDeniedError') {
        DetectRTC.screen.chromeMediaSource = 'DetectRTC.screen.onMessageCallback(): PermissionDeniedError';
        if (screenCallback) { return screenCallback('DetectRTC.screen.onMessageCallback(): PermissionDeniedError'); }
        else { throw new Error('DetectRTC.screen.onMessageCallback(): PermissionDeniedError'); }
      }

      // extension notified his presence
      if (data == MSG_EXT_LOADED) {
        DetectRTC.screen.chromeMediaSource = 'desktop';
      }

      // extension shared temp sourceId
      if (data.sourceId) {
        DetectRTC.screen.sourceId = data.sourceId;
        if (screenCallback) { screenCallback(DetectRTC.screen.sourceId); }
      }
    }

  };


  DetectRTC.init = function() {

    window.addEventListener('message', function (event) {
      if (event.origin != window.location.origin) {
        return;
      }
      DetectRTC.screen.onMessageCallback(event.data);
    });

    // check if desktop-capture extension installed.
    if (window.postMessage && isChrome) {
      DetectRTC.screen.isChromeExtensionAvailable();
    }

    console.log('DetectRTC.screen.init(): DetectRTC.screen.chromeMediaSource', DetectRTC.screen.chromeMediaSource);
  }


})();


if (typeof module !== 'undefined') {
  module.exports.DetectRTC  = DetectRTC;
}

if (typeof window !== 'undefined') {
  window.DetectRTC  = DetectRTC;
}

},{"./../../mylib/utils.js":2}],12:[function(require,module,exports){
/**
 * Created by alykoshin on 3/21/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug     = require('./../../mylib/utils.js').debug;
  var UserMedia = require('./userMediaController.js');
  //var mediaConstraints = require('./mediaConstraints.js').MediaConstraints;
  var VIDEO = require('./mediaConstraints.js').VIDEO;
}

//var
//  SHOW_INACTIVE_VIDEO  = false,//false,
//  SHOW_ACTIVE_VIDEO    = true,
//  SHOW_INACTIVE_SCREEN = false, //false,
//  SHOW_ACTIVE_SCREEN   = true;
//
//var POSTER_VIDEO    = '/images/wrtc_poster_video.png';
//var POSTER_SCREEN   = '/images/wrtc_poster_screen.png';
//var POSTER_NO_VIDEO = '/images/wrtc_poster_user.png';

var DEFAULT_PREVIEW_SIZE = VIDEO.SIZE_320x240;


// Local stream object

//var localMediaBase = function() {
//  var that = {};
//  return that;
//};
/**
 *
 * @param {number} localMediaIndex
 * @returns {UserMedia}
 * @constructor
 */
var LocalMedia = function(localMediaIndex) {

  var MSG_NO_ACCESS = 'No access to audio/video',
    MSG_CANT_ACCESS = 'Cannot get access to media stream from local device',
    MSG_CANT_CAM_MIC = MSG_CANT_ACCESS + ' (camera/microphone).', /* + ' \n\n' +
   'Please make sure to enable chrome flag chrome://flags/#enable-usermedia-screen-capture ', */
    MSG_CANT_CAM_MIC_SCR = MSG_CANT_ACCESS + ' (camera/microphonee/screen capture).';

  var MSG_ERROR_TYPE_OLD = 'Old or incompatible browser',
    MSG_ERROR_NOT_SUPPORTED = 'Currently the browser you are using does not support webRTC.',
    MSG_SUPPORTED_BROWSERS = 'Supported browsers are:' +
      '\n'+'- <a href="https://chrome.google.com">Chrome</a>/Chromium (recommended)' +
      '\n'+'- <a href="http://getfirefox.com">Firefox</a> (with some limitations)' +
      (CONFIG.TEMASYS ? '\n'+'- IE10/11 with <a href=' + CONFIG.TEMASYS.DOWNLOAD.HOME + '>special plugin</a>' : '')+
      '';

  var MSG_ERROR_TYPE_INIT = 'Error initializing video conference',
    MSG_IE10 = 'Unfortunately we only support Internet Explorer-10 for video/audio conference. ' +
      'We are working on making it compatible with other latest versions also. ',
    MSG_ERROR_NEED_PLUGIN= 'Your browser does not support video conference. Please download plugin.';

  var MSG_DOWNLOAD = 'Download plugin...',
    MSG_DOWNLOAD_START = 'Plugin download will start automatically in several seconds...\n',
    MSG_DOWNLOAD_FROM_TROUBLES = 'If you experience troubles with automatic download, you can download plugin from\n',
    MSG_DOWNLOAD_FROM_HOME = CONFIG.TEMASYS ? '<a href='+CONFIG.TEMASYS.DOWNLOAD.HOME+'>Download page</a>\n' : '',
    MSG_DOWNLOAD_FROM = (CONFIG.TEMASYS && CONFIG.TEMASYS.DOWNLOAD.HOME) ? MSG_DOWNLOAD_FROM_TROUBLES + MSG_DOWNLOAD_FROM_HOME : '', // If downloads homepage is set in config
    MSG_UNINSTALL = 'Please, make sure you uninstalled any previous version of plugin before installing this one!';

  var self = new UserMedia();

  //var x, y;

  //  self.localMediaIndex = localMediaIndex;
  self.vid             = null;
  self.mediaType       = null;  /** Defined as MEDIA_TYPE.VIDEO, SCREEN **/
  self.mediaIndex      = localMediaIndex;


    //  /** Constraints for Audio+Video connection for Low and High Bandwidths **/
    //  self.AV_LOW = {
    //    audio: true,
    //    video: {
    //      mandatory: {
    ////          maxFrameRate: 1,
    //        maxWidth:  320,
    //        maxHeight: 240 /** 180-- Gives wide picture, by removing bottom and top **/
    //      },
    //      optional: [/*{maxWidth:320,maxHeight:180}, {maxWidth:320,maxHeight:240}*/]
    //    }
    //  };

    //  self.AV_HIGH = self.AV_HIGH || {
    //    audio: true,
    //    video: true
    //  };

  self.constraints   = self.constraints   || null;// { audio: true, video: true };

  /** Events **/

  self.onBeforeStart = self.onBeforeStart || null;
  self.onAfterStart  = self.onAfterStart  || null;
  self.onErrorStart  = self.onErrorStart  || null;

  self.onBeforeStop  = self.onBeforeStop  || null;
  self.onAfterStop   = self.onAfterStop   || null;

  //  self.showActive    = self.showActive    || true;
  //  self.showInactive  = self.showInactive  || false;

  //var super_onGetUserMediaSuccess = self.onGetUserMediaSuccess;
  /**
   * onGetUserMediaSuccess
   * @param newStream
   **/
  //self.onGetUserMediaSuccess = function (newStream) {
  self.on('start', function(newStream) {
    //    debug.groupCollapsed('LocalMedia.start(): onGetUserMediaSuccess()');
    debug.debug('LocalMedia.start(): onGetUserMediaSuccess(): ' +
      ': self.mediaType: ', self.mediaType ,
      '; newStream:',       newStream);

    //super_onGetUserMediaSuccess(newStream);

    self.vid.attach(self.stream);
    self.vid.setVisible();


    if (self.callback)     { self.callback();     }
    if (self.onAfterStart) { self.onAfterStart(); }

    //    debug.groupEnd();
  });
  //  self.onStart = function(stream) {
  //    self.vid.attach(self.stream);
  //    self.vid.setVisible();
  //  };


  //var super_onGetUserMediaError2 = self.onGetUserMediaError2;
  /**
   * onGetUserMediaError2
   * @param error
   */
  //self.onGetUserMediaError2 = function (error) {
  //self.onError = function (error) {
  //  super_onGetUserMediaError2(error);
  self.on('error', function() {
    if (get_browser() === 'Chrome') {
      // 4.If user is on Chrome , and user don't have camera or does not give acccess to camera then show alert
      // "Cannot get access to media stream from local device (camera/microphone).
      // Please make sure to enable chrome flag chrome://flags/#enable-usermedia-screen-capture "
      messageWrtc(MSG_NO_ACCESS, MSG_CANT_CAM_MIC, '', '' /* error */ /* Hide technical info */ );
    } else {
      messageWrtc(MSG_NO_ACCESS, MSG_CANT_CAM_MIC_SCR, '', '' /* error*/ /*Hide technical info*/);
    }
  });

  // Start local stream and call callback
  var super_start = self.start;
  self.start = function( callback ) {
    debug.log('LocalMedia.start(): self.mediaType:'+self.mediaType);

    if ( ! isWebRTCCompatible() ) {

      if (CONFIG.TEMASYS && (get_browser() === 'MSIE' || get_browser() === 'Safari') ) { // Need to check if we may work with plugin

        if (get_browser() === 'MSIE' && get_browser_version() !== '10' && get_browser_version() !== '11') {
          //        2.If browser is IE , and there is any error due to browser version. then show alert
          //        "Unfortunately we only support Internet Explorer-10 for video/audio conference.
          //        We are working on making it compatible with other latest versions also. "
          messageBox(MSG_ERROR_TYPE_INIT, MSG_IE10);

        } else {
          //       1.If browser is IE , and there is any error due to temasys plugin , then show alert
          //       Your browser does not support video conference. Please download plugin.
          //       And then when user click on OK button then automatically start download of plugin from our own server.
          var link;
          // Links from here: https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins          s
          if (get_browser() == 'MSIE') { // Windows
            link = CONFIG.TEMASYS.DOWNLOAD.IE;
          } else {
            link = CONFIG.TEMASYS.DOWNLOAD.SAFARI;
          } // Mac OS X
          var mb = messageBox(MSG_ERROR_TYPE_INIT, MSG_ERROR_NEED_PLUGIN);

          mb.onClose = function () {
            mb.onClose = null;
            window.location.href = link;
            messageBox(MSG_DOWNLOAD, MSG_DOWNLOAD_START + MSG_DOWNLOAD_FROM + MSG_UNINSTALL);
          };
        }
      } else {
        messageBox(MSG_ERROR_TYPE_OLD, MSG_ERROR_NOT_SUPPORTED, MSG_SUPPORTED_BROWSERS);
      }

    } else {
      self.callback = callback;
      if (self.isActive) { // If Local Media already started
        if (self.callback) { self.callback(); }
      } else {
        super_start();
      }
    }
    debug.groupEnd();
  };

  // Stop local stream
  var super_stop = self.stop;
  self.stop = function() {
    super_stop();
    detachMediaStream( self.vid.getVideo() );

    if (self.onAfterStop) { self.onAfterStop.call(); }
    self.vid.setVisible();
  };


  self.setLowBandwidth = function() {
    self.constraints.setMinMaxSize(null, VIDEO.SIZE_QVGA);
    self.constraints.setMinMaxFrameRate(null, 1);
  };

  var _dragstart = function(e) {
    MEDIA_TYPE.check(self.mediaType);

    if (self.mediaType !== MEDIA_TYPE.VIDEO) { return false; }
    e.dataTransfer.setData('source', 'localVideo');

    // Store id
    //e.dataTransfer.setData("_id", this._id);

    // FF & Chrome support
    var relX = e.offsetX ? e.offsetX : e.layerX;
    var relY = e.offsetY ? e.offsetY : e.layerY;
    //var absX = e.clientX;
    //var absY = e.clientY;
    e.dataTransfer.setData('relX', relX);
    e.dataTransfer.setData('relY', relY);
    e.dataTransfer.effectAllowed = 'move';
    // e.dataTransfer.setData("Text", e.target.getAttribute('id'));
    e.dataTransfer.setDragImage(e.target, relX, relY);
    return true;
  };

  var _dragover = function(ev) {
    ev.preventDefault();
  };

  var _drop = function(ev) {
    ev.preventDefault();
    // FF & Chrome support
    var x = ev.offsetX ? ev.offsetX : ev.layerX;
    var y = ev.offsetY ? ev.offsetY : ev.layerY;

    var origX = ev.dataTransfer.getData('relX');
    var origY = ev.dataTransfer.getData('relY');

    // if localVideo is under the pointer
    //if (e.target.className.indexOf('cardimg') !== -1) {
    if (ev.target.id === 'wrtcLocalVideoOverlay') {
      // we need to take into account its position relative to parent
      x += ev.target.parentElement.offsetLeft;
      y += ev.target.parentElement.offsetTop;
    }
    if (ev.dataTransfer.getData('source') === ('localVideo')) {
      var targetX = x - origX, targetY = y - origY;
      targetX = (targetX > 0) ? targetX : 0;
      targetY = (targetY > 0) ? targetY : 0;
      debug.debug('drop: x:',x,'; y:', y, '; origX:', origX, '; origY:', origY, '; targetX:', targetX, '; targetY:', targetY);
      //self.vid.toNearestCorner(targetX, targetY);
      //localVideo.setXY( targetX,  targetY );
      debug.log('LocalMedia.init(): drop(): Drag&drop disabled.');
    }
    ev.stopPropagation();
    return false;
  };

  self.init = function() {

    debug.log('LocalMedia.init(): - enter');
    debug.log('LocalMedia.init(): self.mediaType:' + self.mediaType + '; self.mediaIndex:' + self.mediaIndex);

    //var vidId = self.mediaType+'_'+self.mediaIndex;
    self.vid = LocalVideoHolder.add(self.mediaType, self.mediaIndex); //vidId);
    self.vid.setVisible();

    /** Set constraints to appropriate audio/video source (if set) **/
    debug.log('LocalMedia.init(): self.constraints.getValue():' + JSON.stringify(self.constraints.getValue() ) +
      '; self.vid: ', self.vid);

    self.vid.getContainer().ondragstart = _dragstart;
    document.body.ondragover          = _dragover;
    //    document.getElementById('wrtcLocalVideoContainer').ondragover = function(ev) {
    //    document.getElementById('wrtcLocalVideoOverlay').ondragover = function(ev) {
    //    document.getElementById('wrtcRemoteVideoHolder').ondragover = function(ev) {
    document.body.ondrop              = _drop;
    //    document.getElementById('wrtcLocalVideoOverlay').ondrop = drop;
    //    document.getElementById('wrtcLocalVideoContainer').ondrop = drop;
    //    document.getElementById('wrtcRemoteVideoHolder').ondrop = drop;

    debug.log('LocalMedia.init(): - exit');
  };

  return self;
};



var LocalVideo = function( localVideoIndex ) {
  var that = new LocalMedia( localVideoIndex );

  that.mediaType    = MEDIA_TYPE.VIDEO;
  that.mediaIndex   = localVideoIndex;

  /**
   * Id of preferred audio source (if set)
   *
   * property
   * @type {string|null}
   */
  that.audioSource = null;
  /**
   * Id of preferred video source (if set)
   * property
   * @type {string|null}
   */
  that.videoSource = null;

  /** Set constraints for video depending on the bandwidth option (low/high) **/
  var super_start = that.start;
  that.start = function( callback ) {
    //that.constraints = () ? that.AV_LOW : that.AV_HIGH;
    if (option_bw === BANDWIDTH.LOW) {
      that.setLowBandwidth();
      //      that.constraints.setMinMaxSize(null, VIDEO.SIZE_QVGA);
    }
    // that.constraints.setMinMaxFrameRate(null, 24);
    super_start( callback );
  };

  return that;
};



var LocalScreen = ( function() {
  var SCREEN_INDEX = 1; /** For Screen the number is always 0 **/
  var that = new LocalMedia( SCREEN_INDEX );
  that.mediaType = MEDIA_TYPE.SCREEN;


  /** We do not set low bandwidth as for Screen Share it will result in unusable low quality video **/
  that.constraints.setMinMaxSize(VIDEO.SIZE_2560x1440, VIDEO.SIZE_2560x1440);
  //that.constraints.setMinMaxFrameRate(null, 1);
  /* !!!                                                     */

  return that;
});


if (typeof module !== 'undefined') {
  module.exports.LocalVideo  = LocalVideo;
  module.exports.LocalScreen  = LocalScreen;
}

if (typeof window !== 'undefined') {
  window.LocalVideo   = LocalVideo;
  window.LocalScreen  = LocalScreen;
}

},{"./../../mylib/utils.js":2,"./mediaConstraints.js":13,"./userMediaController.js":14}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
/**
 * Created by alykoshin on 7/17/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug     = require('./../../mylib/utils.js').debug;
  var Emitter   = require('./../../mylib/emitter.js');
  var DetectRTC = require('./detectRTC.js');
}

/**
 * @constrictor
 * @returns {__UserMedia}
 * @private
 */
var __UserMedia = function() {
  var self = this;

  Emitter(self);

  /**
   * @type {Object}
   * @private
   */
  self._constraints = null;

  /** low-level callbacks */
  self._onGetUserMediaSuccess = null;
  self._onGetUserMediaError   = null;

  /** Handlers */
  self._getUserMediaSuccess = function(newStream) {};
  self._getUserMediaError   = function(error)     {};

  self._getUserMedia = function() {
    debug.log('__UserMedia._getUserMedia(): self._constraints: ' + JSON.stringify(self._constraints));
    getUserMedia( self._constraints, self._getUserMediaSuccess, self._getUserMediaError );
  };

  return self;
};
/**
 *
 * @constrictor
 * @returns {_UserMedia}
 * @private
 */
var _UserMedia = function() {
  var self = new __UserMedia();
  /**
   * Local media stream from camera and microphone
   * @memberOf _UserMedia
   * @type {MediaStream}
   * @private
   */
  self._stream      = null;
//  /**
//   * Local media stream from camera and microphone
//   * @memberOf _UserMedia
//   * @type {Object}
//   */
//  Object.defineProperty(self, "stream", {
//    get: function () {
//      return self._stream;
//    }
//  });

  /**
   * @memberOf _UserMedia
   * @type {boolean}
   * @private
   */
  self._isWaitingUser = false;
  /**
   * @memberOf _UserMedia
   * @type {boolean}
   */
  Object.defineProperty(self, 'isWaitingUser', {
    get: function () {
      return self._isWaitingUser;
    }
  });
  /**
   * @memberOf _UserMedia
   * @type {boolean}
   * @private
   */
  self._isActive      = false;
  /**
   * @memberOf _UserMedia
   * @type {boolean}
   */
  Object.defineProperty(self, 'isActive', {
    get: function () {
      return self._isActive;
    }
  });
  /**
   * @memberOf _UserMedia
   * @param {MediaStream} stream
   * @private
   */
  self._storeStream = function(stream) {

    function setObjectEventDebug(object, prop, debugMethod) {
      object[prop] = function(event) { debug[debugMethod]('_UserMedia: mediaTrack.'+prop+': kind: '+object.kind+', event:', event); };
    }
    /**
     *
     * @param { MediaStreamTrack[] } tracks
     */
    function setTracksDebug(tracks) {
      var i, len;
      for (len=tracks.length, i=0; i<len; ++i) {
        setObjectEventDebug(tracks[i], 'onended',  'warn');
        setObjectEventDebug(tracks[i], 'onmute',   'log');
        setObjectEventDebug(tracks[i], 'onoverconstrained', 'warn');
        setObjectEventDebug(tracks[i], 'onunmute', 'log');
      }
    }

    // Store local stream
    self._stream = stream;

    // Assign event handlers to stream
    self._stream.onEnded = function() {
      debug.error('_UserMedia._storeStream(): _stream.onEnded(): that.stream:', self._stream);
      //self.stop();
    };

    // Assign event handlers to stream tracks
    setTracksDebug(stream.getTracks());
    //setTracksDebug(stream.getAudioTracks());
    //setTracksDebug(stream.getVideoTracks());
  };

  /**
   * Get information on devices used for the stream
   * @param {MediaStream} stream
   * @private
   */
  self._printStreamInfo = function(stream) {
    var msg;
    var audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      debug.info('_UserMedia._printStreamInfo(): Using Audio device: \'' + audioTracks[0].label + '\'');

      msg = '_UserMedia._printStreamInfo(): audioTracks[0].readyState is \''+audioTracks[0].readyState+'\'';
      if (audioTracks[0].readyState === 'ended') { debug.warn(msg); }
      else { debug.log(msg); }
    } else { debug.warn('_UserMedia._printStreamInfo(): stream does not contains audioTracks'); }

    var videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      debug.info('_UserMedia._printStreamInfo(): Using Video device: \'' + videoTracks[0].label + '\'');

      msg = '_UserMedia._printStreamInfo(): videoTracks[0].readyState is \''+videoTracks[0].readyState+'\'';
      if (videoTracks[0].readyState === 'ended') { debug.warn(msg); }
      else { debug.log(msg); }
    } else { debug.warn('_UserMedia._printStreamInfo(): stream does not contains videoTracks'); }
  };
  /**
   * @memberOf _UserMedia
   * @param {MediaStream} newStream
   * @private
   */
  self._getUserMediaSuccess = function(newStream) {
    debug.debug('_UserMedia._getUserMediaSuccess(): newStream:', newStream);

    self._isWaitingUser = false;
    self._isActive      = true;

    self._storeStream(newStream);

    self._printStreamInfo(newStream);

    if (self._onGetUserMediaSuccess) { self._onGetUserMediaSuccess( self._stream ); }
  };
  /**
   * @memberOf _UserMedia
   * @param error
   * @private
   */
  self._getUserMediaError = function(error) {
    debug.debug('_UserMedia._getUserMediaError():', error);

    self._isWaitingUser = false;
    self._isActive      = false;

    if (self._onGetUserMediaError) { self._onGetUserMediaError( error ); }
  };
  /**
   * @memberOf _UserMedia
   * @returns {boolean}
   */
  self.isStarted = function() {
    return !! self._stream;
  };
  /**
   * @memberOf _UserMedia
   */
  self.start = function() {};
  /**
   * Stop local media
   * @memberOf _UserMedia
   */
  self.stop = function() {
    self._isActive = false;
    if (self._stream !== null) {
      self._stream.stop();
      self._stream = null;
    }
  };

  return self;
};

/**
 *
 * @param {MediaConstraints} mediaConstraints
 * @returns {UserMedia}
 * @constructor
 */
var UserMedia = function( mediaConstraints ) {
  var self = new _UserMedia();
  //self._constraints = mediaConstraints.getValue();

//  self.isActive      = false;
//  self.isWaitingUser = false;

//  self.stream        = null;        /** Local media stream from camera and microphone **/

  /**
   *
   * @type {MediaConstraints}
   */
  self.constraints   = mediaConstraints || new MediaConstraints();

  self.audioSource = null; /** Preferred audio source **/
  self.videoSource = null; /** Preferred video source **/

  /** Event handlers **/

  self.onStart = null;
  self.onStop  = null;
  //self.onError = null;

  var super_getMediaSuccess = self._getUserMediaSuccess;
  /**
   * onGetUserMediaSuccess
   * @param {MediaStream} newStream
   */
  self._getUserMediaSuccess = function (newStream) {
//   // debug.groupCollapsed('UserMedia.start(): onGetUserMediaSuccess()');
//    debug.debug('UserMedia.start(): onGetUserMediaSuccess(): newStream:', newStream);
//
//    self._isWaitingUser = false;
//    self._isActive      = true;
//
//    /** Store local stream **/
//    self.stream = new MediaStreamView( newStream );
//
//    //window.s = self.stream;
//
//    self.stream.onEnded = function() {
//      debug.log('UserMedia.onGetUserMediaSuccess(): self.stream.onEnded(): self.stream:', self.stream);
//      self.stop();
//    };
//
    super_getMediaSuccess(newStream);

    self.stream = new MediaStreamView( self._stream );
    debug.log('UserMedia._getUserMediaSuccess(): self.stream:', self.stream);

    if (self.onGetUserMediaSuccess) { self.onGetUserMediaSuccess( self.stream ); }
    if (self.onStart) { self.onStart( self.stream ); }
    self.emit('start', self.stream);
//    //debug.groupEnd();
  };

  /**
   * Attempt to get screen was unsuccessful
   *
   * @param {object|string} error
   **/
  self.onGetUserScreenError = function (error) {
    //if (self.constraints.getScreenEnabled() || self.constraints.getDesktopEnabled()) {
    debug.error('UserMedia.onGetUserMediaError1() error: ', error);
    self._isWaitingUser = false;
    self._isActive = false;
    //if (self.onError) { self.onError(error); }
    self.emit('error', error);
    self.emit('start', null);
    //}
  };

  /**
   * Attempt to get audio & video was unsuccessful
   *
   * @param {object|string} error
   **/
  self.onGetUserVideoAudioError = function (error) {
    // Trying one more time with disabled video
    debug.warn('UserMedia.onGetUserVideoAudioError() error: ', error);
    self._startAudioOnly();
  };

  /**
   * Attempt to get audio only was also unsuccessful
   *
   * @param {object|string} error
   **/
  self.onGetUserAudioOnlyError = function (error) {
    self._isWaitingUser = false;
    self._isActive      = false;
    debug.error('UserMedia.onGetUserAudioOnlyError() error: ', error);
    //if (self.onError) { self.onError(error); }
    self.emit('error', error);
    self.emit('start', null);
  };

  self._startScreen = function() {
    self._onGetUserMediaError = self.onGetUserScreenError;
    // this statement verifies chrome extension availability
    // if installed and available then it will invoke extension API
    // otherwise it will fallback to command-line based screen capturing API
    if (DetectRTC.screen.chromeMediaSource === 'desktop') {

      if (!DetectRTC.screen.sourceId) {

        DetectRTC.screen.getSourceId(function (error) {
          // if exception occurred or access denied
          if (error && error == 'PermissionDeniedError') {
            alert('PermissionDeniedError: User denied to share content of his screen.');
          }
          self.constraints.setDesktopEnabled(DetectRTC.screen.sourceId);
          debug.log('_startScreen(): 1 self._constraints: ' + JSON.stringify(self._constraints));
          self._constraints = self.constraints.getValue();
          self._getUserMedia();
        });

      } else {
        self.constraints.setDesktopEnabled(DetectRTC.screen.sourceId);
        debug.log('_startScreen(): 2 self._constraints: ' + JSON.stringify(self._constraints));
        self._constraints = self.constraints.getValue();
        self._getUserMedia();
      }
    } else {
      self.constraints.setDesktopEnabled(DetectRTC.screen.sourceId);
      debug.log('_startScreen(): 3 self._constraints: ' + JSON.stringify(self._constraints));
      self._constraints = self.constraints.getValue();
      self._getUserMedia();
    }
  };

  self._startVideoAudio = function() {
    self._onGetUserMediaError = self.onGetUserVideoAudioError;
    if (self.audioSource) { self.constraints.setAudioSource(self.audioSource); }
    if (self.videoSource) { self.constraints.setVideoSource(self.videoSource); }
    self._constraints = self.constraints.getValue();
    debug.log('_startVideoAudio(): self._constraints: ' + JSON.stringify(self._constraints));
    self._getUserMedia();
  };

  self._startAudioOnly = function() {
    self._onGetUserMediaError = self.onGetUserAudioOnlyError;
    self.constraints.setVideoEnabled(false);
    self._constraints = self.constraints.getValue();
    debug.log('UserMedia._startAudioOnly(): self._constraints: ' + JSON.stringify(self._constraints));
    self._getUserMedia();
  };

  self.start = function() {
    //debug.groupCollapsed('UserMedia.start()');
    if ( ! isWebRTCCompatible() ) {
      debug.error('UserMedia.start(): Currently the browser you are using does not support webRTC.');
    } else {
      // Check if we still were waiting for user confirmation to access media
      if (self._isWaitingUser) {
        debug.error('UserMedia.start(): isWaitingUser:', self._isWaitingUser);
      }
      self._isWaitingUser = true;

      if ( !self._isActive ) {
        if (self.mediaType === MEDIA_TYPE.SCREEN) {
          self._startScreen();
        } else {
          self._startVideoAudio();
        }

      } else {
        //delayedRepositionAll()
        if (self.onStart) { self.onStart(); }
        self.emit('start', self.stream);
      }
    }
    //debug.groupEnd();
  };

  var super_stop = self.stop;
  self.stop = function() {
    if (self.stream) {
      self.stream.stop();
      self.stream = null;
      super_stop();

      if (self.onStop) { self.onStop(); }
      self.emit('stop');
    } else {
      super_stop();
    }
  };

  return self;
};


if (typeof module !== 'undefined') {
  module.exports  = UserMedia;
}

if (typeof window !== 'undefined') {
  window.UserMedia  = UserMedia;
}

},{"./../../mylib/emitter.js":1,"./../../mylib/utils.js":2,"./detectRTC.js":11}]},{},[5,9,10,12])
//# sourceMappingURL=wrtclib.bundle.map
