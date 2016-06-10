// Deprecated API

function wrtcOnNewRoomCreated(roomId) {
  console.log('example.js: wrtcOnNewRoomCreated(): roomId: \'' + roomId + '\'');
}

// New API

document.addEventListener('wrtc-init-finished', function() {
  console.log('example.js: wrtc-init-finished. All main object are initialized now.');

  wrtc.on('create-room', function(roomId) {
    console.log('example.js: wrtc.on(\'create-room\'): roomId: \'' + roomId + '\'');
  });

});
