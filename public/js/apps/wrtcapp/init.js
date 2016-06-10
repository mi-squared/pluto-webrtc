/**
 * Created by alykoshin on 4/9/14.
 */

if (typeof window.wrtc === 'undefined') {
  window.wrtc = {};
}
window.wrtc.action = null;
window.wrtc.roomId = null;
window.wrtc.autostart = null;
// Events
window.wrtc.onNewRoomCreated = null;
//window.wrtc.onIncomingMessage = null;
//window.wrtc.onAnswer = null;
//window.wrtc.onOffer = null;

var wrtc = window.wrtc;

// !!!  "use strict";
// !!!  does not works BUTTON_STATES _


//var roomId              // Chat Room Identifier
//, action              // createRoom or joinRoom
var START_ACTION = Enum({
  CREATE_ROOM: 'CREATE_ROOM',
  JOIN_ROOM:   'JOIN_ROOM',
  WAIT_ADD_TO_ROOM: 'WAIT_ADD_TO_ROOM'
});
/**
 * @typedef { 'LOW' | 'HIGH' } BANDWIDTH_TYPE
 */
var
  BANDWIDTH = Enum({
    LOW  : 'LOW',
    HIGH : 'HIGH'
  });

/** @type string **/
var option_bw;           // Bandwidth: 'low' / 'high'

/** @type boolean **/
var btnCallRemote_state;          // Button 'Call Remote' State

/** @type boolean **/
var btnCallRemote2_state;         // Button 'Call Remote' State

// call to init() now is in conf.html after 1 second timeout
//document.ondomcontentready = init();
//window.onload = init();

//var transport;
//var socket;

/** @type _LocalVideoHolder **/
var LocalVideoHolder;
/** @type _remoteVideoHolder **/
var remoteVideos;

var localVideo1, localVideo2, localScreen1;

var PAGE_PATIENT      = ['Patient.html'];
var PAGE_PHYSICIAN    = ['Physician.html'];
var PAGE_GENERIC      = ['VideoConference.html'];
var PAGE_CARECONNECT  = ['CareConnect.html'];
var PAGE_GENERIC_V2   = ['VideoConference2.html', 'VideoConference3.html'];
var PAGE_GENERIC_V3   = [
  '2WayVC.html', 'Health_VC.html', 'Patient_VC.html', 'Doctor_VC.html'];

var MAX_CONNECTIONS = 6; // Almost unlimited
//if (PAGE_CARECONNECT.indexOf(getUrlFilename())>-1) {
//  MAX_CONNECTIONS = 1;
//}

/**
 * Definition of properties for one HTML Element
 * @typedef {Object.<string, Object>} ElementProperties
 **/
/**
 *
 * @type {Object.<string, {NORMAL: ElementProperties, IE: ElementProperties}>}
 */
var BUTTON_STATES = {
  INIT: { NORMAL: {
    page1                 : { style: { display: 'none'     } },
    page2                 : { style: { display: 'none'     } },

    btnStartLocal       : { style: { display:    'none'    }, disabled : false },
    btnStartLocal2      : { style: { display:    'none'    } },
    btnStartLScreen     : { style: { display:    'none'    } },
    btnCallRemote       : { style: { display:    'none'    }, disabled : false },
    btnCallRemote2      : { style: { display:    'none'    } },
    btnHangup           : { style: { display:    'none'    }, disabled : true  },
    btnDataChannel      : { style: { display:    'none'    } }
  }},
  GENERIC_LOAD : { NORMAL: {
    //    style                 : { href: "./skins/VideoConference/css/start_style.css"},
    //'wrtcStartInfo'       : { style: { visibility: 'visible' } },
    'wrtcStartInfo'       : { style: { display:    'none' } },
    'wrtcMediaSourceSelect_2': { style: { display: 'none'    } },
    'wrtcChatLog'         : { style: { display: 'none'       } },
    'wrtcChatInputGroup'  : { style: { display: 'none'       } },

    'btnMeetPhysician'    : { style: { display:    'none'    } },
    'btnMeetPhysicianLow' : { style: { display:    'none'    } },
    'btnStartScreen'      : { style: { display:    'none'    } },
    'btnRequestScreen'    : { style: { display:    'none'    } },

    'wrtcYourEmailInput'  : { style: { display:    'none'    } },
    'wrtcOtherEmailInput' : { style: { display:    'inline'    } },
    'wrtcNameInput'       : { style: { display:    'inline'    } },
    'btnStartEmailCall'   : { style: { display:    'inline'    },
      value: 'Start Video Conference' }, // disabled : true },
    page1                 : { style: { display: 'block'     } },
    page2                 : { style: { display: 'none'      } }
  }},
  GENERIC_2 : { NORMAL: {
    //    style                 : { href: "./skins/VideoConference/css/style.css"},
    'wrtcChatLog'         : { style: { display:    'inline'    } },
    'wrtcChatInputGroup'  : { style: { display:    'inline'    } },
    'wrtcMediaSourceSelect_2': { style: { display: 'none'      } },

    'btnStartScreen'      : { style: { display:    'inline'    } },
    'btnHangup'           : { style: { display:    'inline'    } },

    'wrtcYourEmailInput'  : { style: { display:    'none'    } },
    'wrtcOtherEmailInput' : { style: { display:    'none'    } },
    'wrtcNameInput'       : { style: { display:    'none'    } },
    'btnStartEmailCall'   : { style: { display:    'none'    } },// disabled : true },
    page1                 : { style: { display:    'none'      } },
    page2                 : { style: { display:    'block'    } }
  }},
  GENERIC_REMOTE_LOAD : { NORMAL: {
    //    style                 : { href: "./skins/VideoConference/css/start_style.css"},
    //    'wrtcStartInfo'       : { style: { visibility: 'visible'   } },
    'link_area'           : { style: { display:    'none' } },
    //'notes'               : { style: { display:    'none' } },

    'wrtcStartInfo'       : { style: { display:    'none' } },
    'wrtcMediaSourceSelect_2': { style: { display: 'none'      } },

    'btnMeetPhysician'    : { style: { display:    'none'    } },
    'btnMeetPhysicianLow' : { style: { display:    'none'    } },
    'btnStartScreen'      : { style: { display:    'none'    } },
    'btnRequestScreen'    : { style: { display:    'none'    } },
    'btnHangup'           : { style: { display:    'none'    } },

    'wrtcYourEmailInput'  : { style: { display:    'none'    } },
    'wrtcOtherEmailInput' : { style: { display:    'none'    } },
    'wrtcNameInput'       : { style: { display:    'inline'  } },
    'btnStartEmailCall'   : { style: { display:    'inline'    },
      value: 'Join Video Conference'}, //disabled : true },
    page1                 : { style: { display:    'block'    } },
    page2                 : { style: { display:    'none'      } }
  }},
  GENERIC_REMOTE_MEET : { NORMAL: {
    //    style                 : { href: "./skins/VideoConference/css/style.css"},
    'btnHangup'           : { style: { display:    'inline'  } },
    'wrtcNameInput'       : { disabled : true },
    'btnStartEmailCall'   : { disabled : true },
    page1                 : { style: { display: 'none'     } },
    page2                 : { style: { display: 'block'     } }
  }},
  PATIENT_LOAD : { NORMAL: {
    page2                 : { style: { display:    'block'    } } ,
    'wrtcStartInfo'       : { style: { visibility: 'visible' } },

    'btnMeetPhysician'    : { style: { display:    'inline'  } },
    'btnMeetPhysicianLow' : { style: { display:    'inline'  } },
    'btnStartScreen'      : { style: { display:    'none'    } },
    'btnRequestScreen'    : { style: { display:    'none'    } },

    'wrtcYourEmailInput'  : { style: { display:    'none'    } },
    'wrtcOtherEmailInput' : { style: { display:    'none'    } },
    'wrtcNameInput'       : { style: { display:    'none'    } },
    'btnStartEmailCall'   : { style: { display:    'none'    } }//, disabled : true }
  }},
  PATIENT_MEET : { NORMAL: {
    'wrtcStartInfo'       : { style: { visibility: 'visible' } },
    'wrtcMediaSourceSelect_2': { style: { display: 'inline'    } },

    'btnMeetPhysician'    : { style: { display:    'none'    } },
    'btnMeetPhysicianLow' : { style: { display:    'none'    } },
    'btnStartScreen'      : { style: { display:    "inline"  } },
    'btnHangup'           : { style: { display:    'inline'  }  }
  }, IE: {
    btnStartScreen        : { style: { display:    "none"    } }, /** ScreenShare is not available for IE **/
    btnRequestScreen      : { style: { display:    "none"    } }  /** ScreenShare is not available for IE **/
  }},
  PHYSICIAN_LOAD : { NORMAL: {
    page2                 : { style: { display:    'block'    } },
    'wrtcLocalVideoHolder': { style: { display:    'none'    } }, /** Hide all previews for Physician **/

    'wrtcStartInfo'       : { style: { visibility: 'visible' } },

    'btnMeetPhysician'    : { style: { display:    'none'    } },
    'btnMeetPhysicianLow' : { style: { display:    'none'    } },
    'btnStartScreen'      : { style: { display:    'none'    } },
    'btnRequestScreen'    : { style: { display:    'inline'  } },
    btnHangup             : { style: { display:    'inline'  }, disabled : false },

    'wrtcYourEmailInput'  : { style: { display:    'none'    } },
    'wrtcOtherEmailInput' : { style: { display:    'none'    } },
    'wrtcNameInput'       : { style: { display:    'none'    } },
    'btnStartEmailCall'   : { style: { display:    'none'    } }
  }, IE: {
    btnStartScreen        : { style: { display:    "none"    } }, /** ScreenShare is not available for IE **/
    btnRequestScreen      : { style: { display:    "none"    } }  /** ScreenShare is not available for IE **/
  }}
};

BUTTON_STATES.GENERIC_V2_LOAD = BUTTON_STATES.GENERIC_LOAD;
//BUTTON_STATES.GENERIC_V2_LOAD.NORMAL.wrtcYourEmailInput  = { style: { display:    'none'    } };
//BUTTON_STATES.GENERIC_V2_LOAD.NORMAL.wrtcOtherEmailInput = { style: { display:    'none'    } };
//BUTTON_STATES.GENERIC_V2_LOAD.NORMAL.wrtcNameInput       = { style: { display:    'none'    } };

/**
 *
 * @param {string} text
 */
function setInfoText(text) {
  var element = document.getElementById('wrtcStartInfoText');
  if (element) {
    element.innerHTML = text;
  }
}

function createLocalVideo1() {
  if (!localVideo1) {

    localVideo1 = new LocalVideo(1);

    //localVideo1.onBeforeStart = function () {
    //if (btnStartLocal) { btnStartLocal.disabled = true; }
    //btnCallRemote_state = btnCallRemote.disabled;
    //if (btnCallRemote) { btnCallRemote.disabled = true; }
    //wrtcChat.addSystem('Please, allow access to local camera, if requested...<br/>');
    //};
    //localVideo1.onAfterStart = function () {
    //if (btnCallRemote) { btnCallRemote.disabled = btnCallRemote_state; }
    //if (btnHangup)     { btnHangup.disabled = false; }
    //};
    //localVideo1.onAfterStop = function () {
    //if (btnStartLocal) { btnStartLocal.disabled = false; }
    //};
    localVideo1.init();
    ////  localVideo1.vid.setShowInactive( SHOW_INACTIVE_VIDEO );
    ////  localVideo1.vid.setShowActive(   SHOW_ACTIVE_VIDEO );
    ////  localVideo1.vid.setPoster( POSTER_VIDEO );
    localVideo1.vid.setText(wrtc.localUser.getVisibleName());
  }
}
function createLocalVideo2() {
  if (!localVideo2) {

    localVideo2 = new LocalVideo(2);

    localVideo2.text = wrtc.localUser.getVisibleName();//wrtc.localUser.getUser().name + ' [' + wrtc.localUser.getUser().id + ']';
    //localVideo2.onBeforeStart = function () {
    //if (btnStartLocal2) { btnStartLocal2.disabled = true; }
    //btnCallRemote2_state = btnCallRemote.disabled;
    //if (btnCallRemote2) { btnCallRemote2.disabled = true; }
    //wrtcChat.addSystem('Please, allow access to local camera, if requested...<br/>');
    //};
    //localVideo2.onAfterStart = function () {
    //if (btnCallRemote2) { btnCallRemote2.disabled = btnCallRemote2_state; }
    //if (btnHangup) { btnHangup.disabled = false;}
    //};
    //localVideo2.onAfterStop = function () {
    //if (btnStartLocal) {btnStartLocal.disabled = false; }
    //};
    localVideo2.init();
    ////  localVideo2.vid.setShowInactive( SHOW_INACTIVE_VIDEO );
    ////  localVideo2.vid.setShowActive(   SHOW_ACTIVE_VIDEO );
    ////  localVideo2.vid.setPoster( POSTER_VIDEO );
    localVideo2.vid.setText(wrtc.localUser.getVisibleName());
  }
}

onMediaStart = function(conn) {
  // If this is the first connect
  // remove the welcome text
  var element = document.getElementById('welcome_text');
  if (element) {
    element.innerHTML = '';
  }
};

var EndpointMonitor = function() {
  var self = this;
  var toasts = {};

  //self.totalConnects = 0;
  //self.problemConnects = 0;

  self.init = function() {
    //self.totalConnects = 0;
    //self.problemConnects = 0;
    toastr.options = {
      tapToDismiss: false,
      'closeButton': true,
      'debug': false,
      'newestOnTop': false,
      'progressBar': false,
      'positionClass': 'toast-top-full-width', // 'toast-top-right',

      'preventDuplicates': false,//true,

      'onclick': null,
      'showDuration': '150',
      'hideDuration': '150',
      'timeOut': '0',
      'extendedTimeOut': '0',
      'showEasing': 'swing',
      'hideEasing': 'linear',
      'showMethod': 'fadeIn',
      'hideMethod': 'fadeOut'
    };
  };

  self.start = function(conn) {
  };

  self.end = function(conn) {
    self.hide(conn.connId, false);
  };

  self.stop = function(conn) {
    self.show(conn.connId);
  };

  self.fail = function(conn) {
    self.show(conn.connId);
  };

  self.continue = function(conn) {
    self.hide(conn.connId, true);
  };

  self.show = function (connId) {
    var titleHtml = '',
      promptHtml =
        '<div>' +
        '  <span>' +
        '    Looks like there is a network problem.' +
        '    Attempt to restart all the connections?' +
        '  </span>' +
          //'</div>' +
          //'<div>' +
        '  <button type="button"' +
        '          id="restartOk"' +
        '          class="btn btn-primary" ' +
        '          onclick="endpointMonitor.restartOkClick();">Ok</button>' +
        '  <button type="button"' +
        '          id="restartCancel"' +
        '          class="btn"' +
        '          style="margin: 0 8px 0 8px"' +
        '          onclick="endpointMonitor.restartCancelClick();">Cancel</button>' +
        '  <span class="wrtcDebug">connId:' + connId + '</span>' +
        '</div>';

    debug.log('endpointMonitor.show(): connId:', connId);
    var $toast = toastr["error"](
      //var $toast = toastr["warning"](
      titleHtml,
      promptHtml//,
      //{ iconClass: 'toast-monitor-warning' }
    );
    toasts[connId] = $toast;
  };

  self.hide = function(connId, mustExists) {
    var $toast = toasts[connId];
    if ($toast) {
      debug.log('endpointMonitor.hide(): $toastr found, hiding;  connId:', connId);
      toastr.clear($toast);
      delete(toasts[connId]);
    } else {
      debug.warn('endpointMonitor.hide(): $toastr not found; connId:', connId, '; mustExists:', mustExists);
    }
  };

  self.hideAll = function(conn) {
    debug.log('endpointMonitor.hideAll()');
    toastr.remove();
  };

  self.restartOkClick = function() {
    self.hideAll();
    wrtc.reconnect();
  };

  self.restartCancelClick = function() {
    self.hideAll();
  };

};
endpointMonitor = new EndpointMonitor();
endpointMonitor.init();


wrtc.init = function() {
  debug.log('wrtc.init() - enter');


  var _wrtc = new Wrtc();

// Mapping for compatibility
  _.assign(_wrtc, wrtc);

  wrtc = _wrtc;

  windowOnLoad();

  DetectRTC.init();

  wrtcChat.onSend = function(text) {
    wrtc.text(text);
  };



  wrtc.login( {
    name: wrtc.localUser.name,
    roles: wrtc.localUser.roles,
    auth: 'noauth'
  } );

  debug.debug('wrtcInit(): wrtc.action:', wrtc.action, '; wrtc.roomId:', wrtc.roomId, '; wrtc.localUser.id:', wrtc.localUser.id, '; wrtc.localUser.name:', wrtc.localUser.name);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  LocalVideoHolder = new _LocalVideoHolder();
  remoteVideos     = new _remoteVideoHolder();
  //remoteVideos.repositionAll = remoteVideos.repositionOneLeftOtherBelow;
  remoteVideos.repositionAll = remoteVideos.repositionInLine;

  //

  peerConnections.on('media_start',    onMediaStart);
  peerConnections.on('media_start',    endpointMonitor.start);
  peerConnections.on('media_stop',     endpointMonitor.stop);
  peerConnections.on('media_fail',     endpointMonitor.fail);
  peerConnections.on('media_continue', endpointMonitor.continue);
  peerConnections.on('close',          endpointMonitor.end);

  //

  /********************************************************************************************************************/

  clipboardInit('copy_link', 'link');

  if (typeof InlineInstall !== 'undefined') {
    var inlineInstall = new InlineInstall();
    //inlineInstall.init();
    inlineInstall.check();
  }

  /********************************************************************************************************************/

  //  if (PAGE_GENERIC.indexOf(getUrlFilename())>-1) {

  //**

  var ALLOW_LINK_SELECT = false;
  // Select all text if clicked on elem
  if (ALLOW_LINK_SELECT) {
    addEventById('link', 'click', function(event) {
      // For all browsers except Safari
      this.select();

      // For Safari
      this.setSelectionRange(0, this.value.length);
      event.preventDefault(); event.stopPropagation();
    });
  }

  //if ( PAGE_GENERIC.indexOf(getUrlFilename())>-1) {
  //createLocalVideo2();
  //}



  // Emit event when init is finished
  // All the required object are initialized
  // But still some requests for data may be executed
  var event = new CustomEvent('wrtc-init-finished', {} );
  document.dispatchEvent(event);



  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Start all

  START_ACTION.check(wrtc.action);
  console.log('wrtc.action:', wrtc.action);

  if (/*version === 'patient' &&*/ wrtc.action === START_ACTION.CREATE_ROOM) {

    if (PAGE_GENERIC_V2.indexOf(getUrlFilename())>-1) {
      setTimeout(btnStartEmailCallClick, 100); // to allow all event to finish

    } else if (PAGE_GENERIC_V3.indexOf(getUrlFilename())>-1) {
      setTimeout(btnStartEmailCallClick2, 100); // to allow all event to finish
    } else {
      wrtc.createNewRoom();
      wrtc.join(wrtc.roomId);
    }
  } else if (PAGE_PATIENT.indexOf(getUrlFilename())>-1 && wrtc.action === START_ACTION.WAIT_ADD_TO_ROOM) {
    /** do nothing, just wait **/

  } else if (wrtc.action === START_ACTION.JOIN_ROOM) {

    // For PAGE_GENERIC user must enter his name - do not start video immediately

    if (PAGE_GENERIC_V2.indexOf(getUrlFilename())>-1) {

      //setTimeout(
      btnStartEmailCallClick();
      //, 100); // to allow all event to finish

    } else if (PAGE_GENERIC_V3.indexOf(getUrlFilename())>-1) {
      //setTimeout(
      btnStartEmailCallClick2();
      //, 100); // to allow all event to finish

    }  else if ( PAGE_PHYSICIAN.indexOf(getUrlFilename())>-1 ) {

      wrtc.createNewRoom();
      wrtc.join(wrtc.roomId);
      createLocalVideo1();
      localVideo1.start( wrtc.hello );

    } else {
      wrtc.createNewRoom();

    }
  }

  $('.mCustomScrollbar').mCustomScrollbar();

  debug.log('wrtc.init() - exit');
};

var dc;

function btnDataChannelClick(sender) {
  console.log('btnDataChannelClick()');

  for (var i in peerConnections.pcs() ) {
    console.log('btnDataChannelClick(): i=',i);
    /*var*/ dc = new _DataChannel();
    dc._init(peerConnections.pcs()[i].rtcPeerConnection, 'abcd', null);
    console.log(dc);
  }
}
addEventById('btnDataChannel', 'click', btnDataChannelClick);

function setLink(value) {
  //setInfoText('Link to join conference: <a target="_blank" href="' + href + '">' + href + '</a><br>');
  var elLink = document.getElementById('link');
  if (elLink) {
    elLink.value = value;
  }
}



function createScreen1() {
  debug.log('createScreen1()');
  if (!localScreen1) {
    localScreen1 = new LocalScreen();

    localScreen1.onBeforeStart = function() {
      btnStartLScreen.disabled = true;
      wrtcChat.addSystem('Please, allow access to computer screen, if requested...<br/>');
    };
    localScreen1.onAfterStop = function() {
      btnStartLScreen.disabled = false;
    };
    localScreen1.init();
    //  localScreen1.vid.setShowInactive( SHOW_INACTIVE_SCREEN );
    //  localScreen1.vid.setShowActive(   SHOW_ACTIVE_SCREEN );
    //  localScreen1.vid.setPoster( POSTER_SCREEN );
    localScreen1.vid.setText( wrtc.localUser.getVisibleName() );
    localScreen1.vid.getContainer().style = 'display: none';
  }
  return localScreen1;
}


function btnStartEmailCallClick(event) {
  debug.log('btnStartEmailCallClick()');

  // If input boxes were visible to user and the user entered some data, use it
  // otherwise try to get it from url parameters
  wrtc.localUser.name = document.getElementById('wrtcNameInput').value || document.getElementById('opName').value;
  document.getElementById('userName').value = wrtc.localUser.name; /** Override Set by external application on Web server **/

  console.log('btnStartEmailCallClick(): wrtc.localUser.name:', wrtc.localUser.name);


  createLocalVideo1();
  localVideo1.vid.setText( wrtc.localUser.getVisibleName() );

  if (wrtc.action === START_ACTION.JOIN_ROOM) {
    setStates( BUTTON_STATES.GENERIC_REMOTE_MEET );

    setLink('...');

    wrtc.join(wrtc.roomId);
    //socketEmit( MESSAGES.CREATE, { roomId: wrtc.roomId },
    localVideo1.start( wrtc.hello );
    //);

  } else {
    setStates(BUTTON_STATES.GENERIC_2);


    wrtc.createNewRoom();
    wrtc.join(wrtc.roomId);

    // If input boxes were visible to user and the user entered some data, use it
    // otherwise try to get it from url parameters
    var yourEmail  = document.getElementById('wrtcYourEmailInput').value  || '';
    var otherEmail = document.getElementById('wrtcOtherEmailInput').value || getURLParameter('ope');

    //socketEmit( 'create', { roomId: wrtc.roomId },
    doStartEmail(wrtc.localUser.name, yourEmail, otherEmail);
    //);

    var href = generateLink();
    setLink(href);

    localVideo1.start();
  }
}
addEventById('btnStartEmailCall', 'click', btnStartEmailCallClick);

function btnStartEmailCallClick2() {
  debug.log('btnStartEmailCallClick2()');

  // If input boxes were visible to user and the user entered some data, use it
  // otherwise try to get it from url parameters
  wrtc.localUser.name = document.getElementById('wrtcNameInput').value || document.getElementById('opName').value;
  document.getElementById('userName').value = wrtc.localUser.name; /** Override Set by external application on Web server **/

  createLocalVideo1();
  localVideo1.vid.setText( wrtc.localUser.getVisibleName() );

  if (wrtc.action === START_ACTION.JOIN_ROOM) {
    setStates( BUTTON_STATES.GENERIC_REMOTE_MEET );
    localVideo1.start( wrtc.hello );
    wrtc.join(wrtc.roomId);
  } else {
    setStates(BUTTON_STATES.GENERIC_2);
    localVideo1.start();
  }
}


function wrtcInputKeyPress(event) {
  if (event.which === 13) {
    btnStartEmailCallClick(event);
  }
}
addEventById('wrtcYourEmailInput',  'keypress', wrtcInputKeyPress);
addEventById('wrtcOtherEmailInput', 'keypress', wrtcInputKeyPress);
addEventById('wrtcNameInput',       'keypress', wrtcInputKeyPress);


/*
 function wrtcInputChange(event) {
 var inp1 = document.getElementById('wrtcNameInput');
 var inp2 = document.getElementById('wrtcYourEmailInput');
 var inp3 = document.getElementById('wrtcOtherEmailInput');
 var btn  = document.getElementById('btnStartEmailCall');

 var res1 = ( inp1.value.length > 0 );
 var res2 =  validateEmail( inp2.value );
 var res3 =  validateEmail( inp3.value );

 inp1.style.color = res1 ? null : 'red';
 inp2.style.color = res2 ? null : 'red';
 inp3.style.color = res2 ? null : 'red';
 btn.disabled     = ! ( res1 && (res3 || (PAGE_GENERIC.indexOf(getUrlFilename())>-1)) ); //GEdocument.getElementById('version').value === 'generic')) );
 }
 addEventById('wrtcNameInput',       'input', wrtcInputChange);
 addEventById('wrtcYourEmailInput',  'input', wrtcInputChange);
 addEventById('wrtcOtherEmailInput', 'input', wrtcInputChange);
 */

/*function containerDblClick(event, sender) {
  var htmlVideo = sender.getElementsByClassName('wrtcVideoElement')[0];
  fullScreen.toggle(htmlVideo);
  event.preventDefault();
}*/

function generateLink() {
  "use strict";
  ///
  // window.location paramters:
  //
  // host: "localhost:8080"
  // hostname: "localhost"
  // href: "https://localhost:8080/Physician.html?roomId=4yidej0ee"
  // origin: "https://localhost:8080"
  // pathname: "/Physician.html"
  // port: "8080"
  // protocol: "https:"
  // search: "?roomId=4yidej0ee"
  //

  function genParamStr(obj) {
    var res = '';
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        res += prop +'=' + obj[prop] + '&';
      }
    }
    if (res) { res = res.substr(0, res.length-1); }
    return res;
  }

  var protocol = window.location.protocol,  /**  'https:'   **/
  host       = window.location.host,        /**  '184.72.220.242:3003' **/
    //port     = window.location.port,
  pathname1  = window.location.pathname,    /** '/Patient.html' **/
  pathname2  = pathname1.replace(PAGE_PATIENT, PAGE_PHYSICIAN);
  //roomId     = wrtc.roomId; // document.getElementById('roomId').value,

  // system parameters
  var params = {};
  params.roomId = wrtc.roomId;
  if (option_bw === BANDWIDTH.LOW) {
    params.bw = BANDWIDTH.LOW; // set 'LOW' for remote end (for Physician) also
  }
  //if (wrtc.autostart) { params.autostart = wrtc.autostart; }

  // externally provided parameters
  if (document.getElementById('opName').value) { params.opName = document.getElementById('opName').value; }
  if (document.getElementById('opuid').value)  { params.opuid  = document.getElementById('opuid').value; }

  var href = protocol + '//' + host + pathname2 + '?' + genParamStr(params) ;

  return href;
}



/**
 * Button 'Meet Physician' was clicked
 **/
function meetPhysicianClick(event) {
  var btnMeet2       = document.getElementById('btnMeetPhysicianLow');

  if (this === btnMeet2) {
    option_bw = BANDWIDTH.LOW;
  }

  var href = generateLink();
  setInfoText('Link to join conference: <a target="_blank" href="' + href + '">' + href + '</a><br>');

  setStates(BUTTON_STATES.PATIENT_MEET);

  createLocalVideo1();

  localVideo1.start();

  MediaSources.onReady = function() {
    MediaSources.populateCombos(2);
    MediaSources.onChange = function() {
      // hangup previous connection
      peerConnections.hangupFromLocalByMedia(MEDIA_TYPE.VIDEO, 2);
      if (localVideo2) {
        localVideo2.stop();
      }

      // If both source selected then
      if ( ( !VIDEO2_AUDIO || MediaSources.getAudioSourceId(2) ) && MediaSources.getVideoSourceId(2)) {
        callRemote2Click();  // connect
      }
    };
  };

  MediaSources.retrieve();

}
addEventById('btnMeetPhysician',    'click', meetPhysicianClick);
addEventById('btnMeetPhysicianLow', 'click', meetPhysicianClick);


setWrtcAction = function() {
  "use strict";
  // if already know roomId, this means, we are the called party (Physician or GENERIC_REMOTE)
  // and joining Patient initiated conference
  wrtc.action = wrtc.roomId ? START_ACTION.JOIN_ROOM : START_ACTION.CREATE_ROOM;
  console.log('readUrlParams(): wrtc.action', wrtc.action);

  $('#wrtcMainWrapper').addClass(wrtc.action);
};


readUrlParams = function() {
  "use strict";

  function urlToPage(urlParamName, pageParamName) {
    var val = getURLParameter(urlParamName);
    assert( document.getElementById(pageParamName), 'Corresponding element on page not found, pageParamName:\'' + pageParamName + '\'');
    if (val) { document.getElementById(pageParamName).value = val; }
  }

  wrtc.roomId = getURLParameter('roomId');

  // Set action according to what we know from URL
  setWrtcAction();

  urlToPage('roomId', 'roomId');                // roomId parameter

  //urlToPage('autostart', 'autostart');        // autostart

  //urlToPage('tpuid',   'tpuid');              // Calling party user id (This Party Uid)                                                                       s
  //urlToPage('tpe',     'wrtcYourEmailInput'); // Calling party email

  START_ACTION.check(wrtc.action);
  if (wrtc.action === START_ACTION.CREATE_ROOM) {
    urlToPage('name', 'wrtcNameInput');         // Calling party user name
  } else {
    urlToPage('opName', 'wrtcNameInput');       // Calling party user name
  }

  //console.log('localuser>', getURLParameter('opName'));
  //console.log('localuser>wrtc.action', wrtc.action);

  urlToPage('opemail', 'wrtcOtherEmailInput'); // Called party email
  urlToPage('opuid',   'opuid');               // Called party user id (Other Party Uid)
  urlToPage('opName',  'opName');              // Called party user name
  urlToPage('roles',   'roles');
};

readPageParams = function() {
  "use strict";

  // Get parameters from HTML

  if (!wrtc.roomId) {
    wrtc.roomId = document.getElementById('roomId').value;
  }

  // Set action according to what we know from HTML
  // if already know roomId, this means, we are the called party (Physician or GENERIC_REMOTE)
  // and joining Patient initiated conference
  setWrtcAction();

  //wrtc.autostart = document.getElementById('autostart').value;


  //document.getElementById('action').value = action;

  //var action  = document.getElementById('action').value;
  //var uid     = document.getElementById('userId').value;
  //  var version = document.getElementById('version').value;
  if (!wrtc.localUser.name) {
    wrtc.localUser.name = document.getElementById('wrtcNameInput').value; // Set by external application on Web server
    console.log('readPageParams(): wrtc.localUser.name:', wrtc.localUser.name);
  }

  if(!wrtc.localUser.roles) {
    wrtc.localUser.roles = ( $('#roles').val() ).split(',');
  }
  //var DEFAULT_ROLES = ['employee', 'patient', 'doctor'];

};

function windowOnLoad() {


  // Read parameters from URL
  readUrlParams();
  // Read parameters from hidden elements on the page
  readPageParams();


  // Set initial states for buttons and other HTML elements
  setStates(BUTTON_STATES.INIT);

  //var action = document.getElementById('action').value;
  //var roomId = getURLParameter('roomId');
  //var roomId = document.getElementById('roomId').value;

  var userId;

  // Extract Bandwidth parameter
  option_bw = getURLParameter('bw');
  option_bw = option_bw ? option_bw : BANDWIDTH.HIGH;
  debug.log('windowOnLoad(): option_bw:', option_bw);


  var uidPrefix = '';
  // if roomId was extracted from page URL,
  //  it means, we are the called party (Physician or GENERIC_REMOTE)
  //  and joining Patient initiated conference
  //if (roomId) {
  if (wrtc.action === START_ACTION.JOIN_ROOM) {

    if (PAGE_PHYSICIAN.indexOf(getUrlFilename())>-1) {
      wrtc.uidPrefix = 'Physician';
      setStates(BUTTON_STATES.PHYSICIAN_LOAD);
      setInfoText('Joining room ' + roomId + '...');

    } else {
      wrtc.uidPrefix = 'Called';
      setStates(BUTTON_STATES.GENERIC_REMOTE_LOAD);
      setInfoText('Please, enter your name and press \'Start Video Conference\' to join.');
      // remove welcome text in the middle of screen (needed only for initiator)
      var elWelcome = document.getElementById('welcome_text');
      if (elWelcome) {
        elWelcome.innerHTML = '';
      }
    }

    //action = 'joinRoom';

  } else {
    /** No roomId was provided,
     * it means, we are calling party (Patient or GENERIC)
     * and creating new room **/

    //wrtc.createNewRoom();
    // but not now - only when needed

    if ( PAGE_PATIENT.indexOf(getUrlFilename())>-1) {
      wrtc.uidPrefix = 'Patient';
      setStates( BUTTON_STATES.PATIENT_LOAD );
      setInfoText('Press the one of the buttons below to meet Physician...');

    } else {
      wrtc.uidPrefix = 'Calling';

      var otherPartyEmail = getURLParameter('ope');
      if (otherPartyEmail) {
        setStates(BUTTON_STATES.GENERIC_V2_LOAD);

      } else {
        setStates(BUTTON_STATES.GENERIC_LOAD);
        setInfoText('Please, enter your name and email address...');
      }
    }

    //action = 'createRoom';
  }
  //wrtc.internalUserId =
  //wrtc.localUser.generateId(uidPrefix);
  //document.getElementById('action').value = action;
  //document.getElementById('roomId').value = roomId;
  //document.getElementById('userId').value = userId;
}

var WebRTCReadyCb = function() {
  debug.debug('Temasys: WebRTCReadyCb() - enter');
  try {
    //
    //
    // here we need to init the call from physician !!!
    //

    // Turn on debugging for Temasys Plugin if required by config (in file app_config.js)
    if (get_temasys_version() && CONFIG.TEMASYS.DEBUG_LEVEL && CONFIG.TEMASYS.DEBUG_LEVEL !=="NONE" ) {
      set_temasys_debug(CONFIG.TEMASYS.DEBUG_LEVEL);
      //    plugin().setLogFunction(debug);
      //    plugin().setLogLevel(CONFIG.TEMASYS.DEBUG_LEVEL);
    }

    //  windowOnLoad();
    wrtc.init();

  } finally {
    if (wrtcSpinner) { wrtcSpinner.stop(); }
  }
  debug.debug('Temasys: WebRTCReadyCb() - exit');
};

//WebRTCReadyCb();


//};
