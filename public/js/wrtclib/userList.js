'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug     = require('./../../mylib/utils.js').debug;
  //var UserMedia = require('./userMediaController.js');
  //var mediaConstraints = require('./mediaConstraints.js').MediaConstraints;
  //var VIDEO = require('./mediaConstraints.js').VIDEO;
}


var UNIQ_ID = true,
  UNIQ_NAME = false;


var UserList = function() {
  var self = this;
  Emitter(self);
  self.users = [];
  var arr = [];
  arr.push.apply(arr, arguments);
  arr.__proto__ = UserList.prototype;
  Emitter(arr);
  return arr;

  //Object.defineProperty(this, 'length', {
  //  get: function() { return self.users.length; },
  //  configurable: false,
  //  enumerable: false
  //});


};

UserList.prototype = new Array;

UserList.prototype.add = function(user, status) {
  console.log('UserList.prototype.add()');
  var self = this;
  for (var len=self.length, i=len-1; i>=0; --i) {
    //for (var len=self.users.length, i=len-1; i>=0; --i) {
    if ( (UNIQ_ID && self[i].user.id === user.id) ||
        //if ( (UNIQ_ID && self.users[i].user.id === user.id) ||
      ( UNIQ_NAME && self[i].user.name === user.name) ) {
      //( UNIQ_NAME && self.users[i].user.name === user.name) ) {
      debug.warn('UserList: add(): User already exists, user:', user);
      return;
    }
  }
  self.push({user: user, status: status});
  self.emit('add', user, status);
};

UserList.prototype.remove = function(user) {
  console.log('UserList.prototype.remove()');
  var self = this;
  var userCount = 0;
  for (var len=self.length, i=len-1; i>=0; --i) {
    //for (var len=self.users.length, i=len-1; i>=0; --i) {
    if (self[i].user.id === user.id) {
      //if (self.users[i].user.id === user.id) {
      self.splice(i,1); // Remove the user from the list
      self.emit('remove', user);
      if (++userCount>1) { debug.warn('UserList: remove(): User already exists, user:', user); }
    }
  }
  debug.warn('UserList: User not found, user:', user);
};

UserList.prototype.status = function(user, status) {
  console.log('UserList.prototype.status()');
  var self = this;
  var userCount = 0;
  var res = null;
  for (var len=self.length, i=len-1; i>=0; --i) {
    //for (var len=self.users.length, i=len-1; i>=0; --i) {
    if (self[i].user.id === user.id) {
      //if (self.users[i].user.id === user.id) {
      if (typeof status !== 'undefined') { // Get status
        self[i].status = status;
        //self.users[i].status = status;
        self.emit('status', user);
      }
      res = self[i].status;
      //res = self.users[i].status;
      if (++userCount>1) { debug.warn('UserList: status(): User already exists, user:', user); }
    }
  }
  return res;
};

UserList.prototype.doStatus = function(user, status) {
  console.log('UserList.prototype.doStatus()');
  var self = this;
  switch (status) {
    case 'online':
      self.add(user, status);
      break;
    case 'offline':
      self.remove(user);
      break;
    default:
      self.status(user, status);
      break;
  }
};

UserList.prototype.onNotify = function(msgData) {
  console.log('UserList.prototype.onNotify()');
  var self = this;
  var origUser = new wrtc.User( msgData.from );
  var data     = msgData.data;
  if (data.status !== 'undefined') {
    self.doStatus(origUser, data.status);
  }
};

//if (typeof window.wrtc === 'undefined') {
//  window.wrtc = {};
//}
//
//if (typeof window.wrtc.userList === 'undefined') {
//  window.wrtc.userList = new UserList();
//}


if (typeof module !== 'undefined') {
  module.exports.UserList   = UserList;
}

if (typeof window !== 'undefined') {
  window.UserList   = UserList;
}
