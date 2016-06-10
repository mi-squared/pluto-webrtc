/**
 * Created by alykoshin on 17.02.15.
 */

"use strict";

//var SingleAttachable = function(that) {
//
//  that.attached = null;
//
//  that.attachTo = function(attachable) {
//    that.attached = attachable;
//    attachable.attachingTo(that);
//  };
//
//  that.detachFrom = function(attachable) {
//    if (attachable !== that.attached) {
//      throw 'SingleAttachable.detachFrom: attachable !== attached';
//    }
//    attachable.detachingFrom(that);
//    that.attached = null;
//  };
//
//  return that;
//};

/**
 *
 * @class Attachable
 * @param {object} self
 * @returns {object}
 * @constructor
 */
var Attachable = function(self) {

  /** Private properties **/

  /** Array of object to which this MultiAttachable is Attached **/
  var attachedTo = [];

  /** Public methods - attach/detach **/

    self.attachTo = function(attachable) {
      debug.debug('Attachable.attachTo(', attachable, ')');
      self.attachingTo(attachable);
      attachable.attachingTo(self);
    };

    self.detachFrom = function(attachable) {
      self.detachingFrom(attachable);
      attachable.detachingFrom(self);
    };

  /**
   * name attachingTo
   * memberOf Attachable
   * @param {Attachable} attachable
   */
  self.attachingTo = function( attachable ) {
    debug.debug('Attachable.attachingTo(', attachable, ')');
    attachedTo.push(attachable);
  };

  self.detachingFrom = function( attachable ) {
    debug.debug('Attachable.detachingFrom(', attachable, ')');
    for (var i = attachedTo.length-1; i >= 0; i--) {
      if (attachedTo[i] === attachable) {
        attachedTo.slice(i, 1);
      }
    }
  };

  self.detachAll = function() {
    for (var i = attachedTo.length-1; i >= 0; i--) {
      attachedTo[i].detach( self ); /** Attachable.detach() will call self.detachingFrom() **/
    }
  };

  self.isAttached = function () {
    debug.debug('Attachable.isAttached()');
    return ( attachedTo.length > 0 );
  };

  return self;
};
