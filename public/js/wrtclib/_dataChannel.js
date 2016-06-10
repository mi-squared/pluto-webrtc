/**
 * Created by alykoshin on 10/1/14.
 */

"use strict";

var _DataChannel = function() {
  var self = this;

  self.DATACHANNEL_OPTIONS =   {
    //ordered: false, // do not guarantee order
    //maxRetransmitTime: 3000, // in milliseconds
    //maxRetransmits: //
  };

  self._dataChannelOptions = _.clone(self.DATACHANNEL_OPTIONS);

  self._dataChannelLabel = null;

  self._peerConnection = null;

  self._init = function(_peerConnection, _dataChannelLabel, _dataChannelOptions) {
    console.log('_DataChannel._init(): _dataChannelLabel:', _dataChannelLabel);

    self._peerConnection     = _peerConnection;
    self._dataChannelLabel   = _dataChannelLabel;
    self._dataChannelOptions = _dataChannelOptions || self._dataChannelOptions;

    self._dataChannel = _peerConnection.createDataChannel(self._dataChannelLabel, self._dataChannelOptions);
    console.log('_DataChannel._init(): self._dataChannel:', self._dataChannel);

    self._dataChannel.onmessage = function (event) {
      console.log('_DataChannel._dataChannel.onmessage():', event.data);
    };

    self._dataChannel.onopen = function () {
      console.log('_DataChannel._dataChannel.onopen()');

      self._dataChannel.send("Hello World!");
    };

    self._dataChannel.onclose = function () {
      console.log('_DataChannel._dataChannel.onclose()');
    };

    self._dataChannel.onerror = function (error) {
      console.error('DataChannel._dataChannel.onerror():', error);
    };
  };

  self._send = function(data) {
    self._dataChannel.send(data);
  };

  return self;
};
