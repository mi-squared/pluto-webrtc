/**
 * Created by alykoshin on 17.09.15.
 */


'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {

}

// Ticker

var Ticker = function (options, onTick) {
  var self = this;

  self.onTick = onTick;
  self.options = options;

  self.intervalId = null;
  self.startTime = null;

  options = options || {};
  options.autostart = options.autostart || false;
  options.interval = options.interval || 1;
  self.options = options;

  if (options.autostart) {
    self.start();
  }

  self._setInterval = function () {
    //var self = this;
    self.intervalId = setInterval(self._onTick, self.options.interval * 1000);
  };

  self._onTick = function () {
    //var self = this;
    var diffMsec = Date.now() - self.startTime;
    //console.log('_onTick: self:', self, 'this:', this, 'diffMsec:', diffMsec, '; Date.now():', Date.now(), '; self.startTime:', self.startTime);
    var diffDate = new Date(diffMsec);
    //console.log(diffDate);
    var timeStr = diffDate.toISOString().substr(11, 8);
    if (self.onTick) {
      self.onTick(timeStr);
    }
  };

  self.start = function (restart) {
    //var self = this;
    restart = restart || false;
    console.log('self.active():', self.active(), '; restart:', restart);
    if (restart || !self.active()) {
      self.restart();
    }
  };

  self.restart = function () {
    //var self = this;
    if (self.active()) {
      self.stop();
    }
    self.reset();
    self._setInterval();
  };

  self.stop = function () {
    //var self = this;
    if (self.intervalId) {
      clearInterval(self.intervalId);
      self.intervalId = null;
    }
  };

  self.reset = function () {
    //var self = this;
    self.startTime = Date.now();
    var timeStr = '00:00:00';
    if (self.onTick) {
      self.onTick(timeStr);
    }
  };

  self.active = function (val) {
    if (typeof val === 'undefined') {
      return !!self.intervalId;
    } else {
      if (val) { self.start(); }
      else { self.stop(); }
      return val;
    }
  };
};


if (typeof module !== 'undefined') {
  module.exports  = Ticker;
}

if (typeof window !== 'undefined') {
  window.Ticker  = Ticker;
}

