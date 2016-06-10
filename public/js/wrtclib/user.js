'use strict';

(function () {

  /**
   * @typedef {{id: string, name: string, roles: string[], string auth }} ConnectionUser
   */

  /**
   * Show userId as a part of user name for debug purposes (where applicable)
   *
   * @type {boolean}
   * @const
   */
  var LOCAL_SHOW_IDS = false;

  /**
   *
   * @param {ConnectionUser} [user]
   * @constructor
   */
  function User( user ) {
    //var self = this;
    this.id    = user && user.id;
    this.name  = user && user.name;
    this.roles = user && user.roles;
    this.auth  = user && user.auth;
  }

  /**
   *
   * @param {string} [uidPrefix='userId']
   * @returns {string}
   */
  User.prototype.generateId = function (uidPrefix) {
    //userId = userId ? userId : transport.socket.sessionid;
    var userId = uidPrefix ? uidPrefix : 'userId';
    userId += '_' + genStrId();

    this.id = userId;

    return userId;
  };

  /**
   *
   * @returns {ConnectionUser}
   */
  User.prototype.getUser = function() {
    return {
      id:    this.id,
      name:  this.name,
      roles: this.roles
    };
  };

  /**
   *
   * @returns {string}
   */
  User.prototype.getVisibleName = function() {
    return ( this.name ? this.name : 'anonymous') +
      ( LOCAL_SHOW_IDS ? ' [' + this.id +']' : '');
  };


  function LocalUser() {
  }
  LocalUser.prototype = new User();
  LocalUser.prototype.constructor = LocalUser;


  if (typeof window.wrtc === 'undefined') {
    window.wrtc = {};
  }

  if (typeof window.wrtc.localUser === 'undefined') {

    // Make constructors public
    window.wrtc.User = User;
    window.wrtc.LocalUser = LocalUser;

    // Create user object
    window.wrtc.localUser = new LocalUser();
  }

})();

///** @type string **/
//var  localId;             // User Identifier

///** @type string **/
//var localUserName;

//function getLocalId() {
// В качестве уникального идентификатора участника соединения используем идентификатор веб-сокета
// (его пример: '6ORLWJRf3sCb_TDOST4')
//return socket.socket.sessionid;
//return localId;
//}

///**
// *
// * @param {string} uidPrefix
// * @returns {string}
// */
//function generateUserId(uidPrefix) {
//  var userId = uidPrefix ? uidPrefix : 'userId';
//  userId += '_' + genStrId();
//  return userId;
//}

///**
// *
// * @returns {string}
// */
//function getLocalVisibleName() {
//  return getUserVisibleName( wrtc.localUser.getUser() );
//}

