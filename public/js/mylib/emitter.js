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
