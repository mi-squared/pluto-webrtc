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

