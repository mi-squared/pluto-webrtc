var MESSAGES = {
  CONFIG:       'msg-config',
  LOGIN:        'msg-login',
  TEXT:         'msg-text',
  PUBLISH:      'msg-publish',
  NOTIFY:       'msg-notify',
  INVITE_URL:   'msg-invite-url',
  INVITE_TEXT_CHAT: 'msg-invite-text-chat',
  SEND_EMAIL:      'msg-sendEmail',
  CREATE_ROOM:     'create-room', // 'msg-create', // For backward compatibility
  ADD_TO_ROOM:     'msg-add-to-room',
  HELLO:           'msg-hello',
  HELLO_VIDEO_2_0: 'msg-helloVideo2_0',
  HELLO_VIDEO_2:   'msg-helloVideo2',
  HELLO_SCREEN_0:  'msg-helloScreen0',
  HELLO_SCREEN:    'msg-helloScreen',
  HANGUP:          'msg-hangup',

  WEBRTC_OFFER:        'msg-offer',
  WEBRTC_OFFER_2:      'msg-offer2',
  WEBRTC_OFFER_SCREEN: 'msg-offerScreen',
  WEBRTC_ANSWER:       'msg-answer',
  WEBRTC_ICE:          'msg-ice'
};

var USER_STATUS = {
  ONLINE:  'online',
  OFFLINE: 'offline'
};


if (typeof module !== 'undefined' && module && module.exports) {
  module.exports.MESSAGES    = MESSAGES;
  module.exports.USER_STATUS = USER_STATUS;
}
