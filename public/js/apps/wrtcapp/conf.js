'use strict';



function socketOnMessage(data) {

  if (data.name === MESSAGES.HELLO         // Если пришел запрос от нового участника
    && data.roomId === wrtc.roomId) {      // Is it for our room?

    debug.info('Received hello from new participant. Starting negotiation...');
    //if (!wasHello) {
    //  wasHello = true;
    doOffer(data.from);  // Every room participant will send OFFER in response to hello
    //}

  } else if (data.name === MESSAGES.HELLO_VIDEO_2_0 // Workaround for non-working screenshare in backward direction
    && data.roomId === wrtc.roomId) {                 // Is it for our room?

    debug.info('Received hello2. Starting negotiation...');
    doHelloVideo2(); // Every room participant will send OFFER in response to hello

  } else if (data.name === MESSAGES.HELLO_VIDEO_2   // Request for second camera
    && data.roomId === wrtc.roomId) {                 // Is it for our room?

    debug.info('Received helloVideo2. Starting negotiation...');
    doOffer2(data.from); // Every room participant will send OFFER in response to hello

  } else if (data.name === MESSAGES.HELLO_SCREEN_0  // Workaround for non-working screenshare in backward direction
    && data.roomId === wrtc.roomId) {

    debug.info('Received helloScreen0. Starting negotiation...');
    doHelloScreen();

  } else if (data.name === MESSAGES.HELLO_SCREEN  // helloScreen
    && data.roomId === wrtc.roomId) {        // Is it for our room?
    debug.info('Received helloScreen. Starting negotiation...');
    doOfferScreen(data.from); // Every room participant will send OFFER in response to hello

    // Messages for particular connection

  } else if (data.name === MESSAGES.WEBRTC_OFFER        // offer
    && data.to && data.to.id === wrtc.localUser.id) { // Is it for connection (we may not check roomId as we have uniq connection known only for server and room participants)

    debug.info('offer from remote received...');
    doAnswer(data.from, data.connId, data.data); // ...то формируем и посылаем ему Answer

  } else if (data.name === MESSAGES.WEBRTC_OFFER_2 &&          // offer2
    data.to && data.to.id === wrtc.localUser.id) { // Is it for connection (we may not check roomId as we have uniq connection known only for server and room participants)

    debug.info('offer2 from remote received...');
    doAnswer2(data.from, data.connId, data.data); // ...то формируем и посылаем ему Answer

  } else if (data.name === MESSAGES.WEBRTC_OFFER_SCREEN &&   // offerScreen
    data.to && data.to.id === wrtc.localUser.id) {    // Is it for connection (we may not check roomId as we have uniq connection known only for server and room participants)

    debug.info('offerScreen from remote received...');
    doAnswerScreen(data.from, data.connId, data.data); // ...то формируем и посылаем ему Answer

  } else if (data.name === MESSAGES.WEBRTC_ANSWER              // answer
    && data.to && data.to.id === wrtc.localUser.id          // Is it for connection (we may not check roomId as we have uniq connection known only for server and room participants)
  /* && peerConnections.exists(data.connId) */) { // и RTCPeerConnection с отправителем существует

    debug.info('Answer received. Waiting for the media from remote...');
    // Задаем у RTCPeerConnection SDP дальней стороны
    peerConnections.onAnswerReceived(data.connId, data.from, data.data);

  } else if (data.name === MESSAGES.WEBRTC_ICE &&              // Ice Candidate from Remote side
    data.to && data.to.id === wrtc.localUser.id          // If it for our userId
  /* && peerConnections.exists(data.connId) */) { // ...and RTCPeerConnection for that sender exists

    peerConnections.addIce(data.connId, data.data);

  } else //{
    if (data.name === MESSAGES.HANGUP                // Если пришло разъединение:
//        && (data.to === wrtc.localUser.id || !data.to) ) {  // with our ID or without ID at all
    && (!data.to || data.to.id === wrtc.localUser.id)) { //
    debug.info('Hangup received from remote...');

    doHangupFromRemote(data.from, data.connId);
    //wasHello = false;

  }

    //console.log('data.to:', data.to, '; wrtc.localUser.id:', wrtc.localUser.id);

  else  if ((data.name === MESSAGES.TEXT) &&
//         && (data.to === wrtc.localUser.id || !data.to) ) { // with our ID or without ID at all
    (!data.to || data.to.id === wrtc.localUser.id )) { //

    var text = unescape(data.data);
    wrtcChat.addRemote(data.from, text);

  }
//}
debug.groupEnd();
}

/** @typedef {{ forward: boolean backward: boolean }} MEDIA_DIRECTION **/
/**
 * From hello's sender (Physician->Patient)
 * @type {boolean}
 */
var screen_forward  = true;
/**
 * To hello's sender (Patient->Physician)
 * @type {boolean}
 */
var screen_backward = false;

/** @type MEDIA_DIRECTION **/
var VIDEO1_DIRECTIONS = { forward: true,           backward: true };
// var VIDEO1_DIRECTIONS = { forward: true,           backward: true };
var VIDEO2_DIRECTIONS = { forward: true,          backward: false }; // Video 2 - 2nd camera of the Patient, no need in 2nd direction
var SCREEN_DIRECTIONS = { forward: screen_forward, backward: screen_backward };


function checkConnectionsLimit() {
  console.log('checkConnectionsLimit(): peerConnections.count():', peerConnections.count(), '; MAX_CONNECTIONS:', MAX_CONNECTIONS);
  if (peerConnections.count() >= MAX_CONNECTIONS) {
    debug.error('checkConnectionsLimit: MAX_CONNECTIONS exceeded:', MAX_CONNECTIONS);
    //throw 'This conference room is already have maximum users allowed.';
    return true;
  }
  return false;
}

function doHelloVideo2_0() {
  wrtc.sendEvent(MESSAGES.HELLO_VIDEO_2_0, null, null, null);
}

function doHelloVideo2() {
  wrtc.sendEvent(MESSAGES.HELLO_VIDEO_2, null, null, null);
  //btnCallRemote2.disabled = true;
  //btnHangup.disabled     = false;
}

function doHelloScreen0() {
  wrtc.sendEvent(MESSAGES.HELLO_SCREEN_0, null, null, null);
}
function doHelloScreen() {
  wrtc.sendEvent(MESSAGES.HELLO_SCREEN, null, null, null);
}

/**
 * @param {string} nameFrom
 * @param {string} addressFrom
 * @param {string} addressTo
 */
function doStartEmail(nameFrom, addressFrom, addressTo) {
  wrtc.sendEvent(MESSAGES.SEND_EMAIL, null, null, {
    nameFrom:    nameFrom,
    addressFrom: addressFrom,
    addressTo:   addressTo,
    url:         generateLink()
  } );
}

/**
 *
 * @type {string}
 * @const
 */
//var MSG_DO_OFFER = 'User is Online';
var MSG_DO_OFFER = '{name} is available';

/** Формирование Offer SDP
 *  Установление соединения начинается с уже знакомого формирования Offer SDP,
 *  который на этот раз мы не только выведем на экран, но и передадим другим участникам
 *  (метод createOffer объявлен в adapter.js):
 *
 * @param mediaType
 * @param offerId
 * @param {MEDIA_DIRECTION} direction
 * @param localMedia
 * @param {ConnectionUser} remoteUserObj
 * @private
 */
function _doOffer(mediaType, offerId, direction, localMedia, remoteUserObj) {

  function connOffer() {
    peerConnections.offer(mediaType, offerId, VIDEO1_DIRECTIONS, localMedia, wrtc.localUser.getUser(), remoteUserObj );
  }
  assert(direction.forward || direction.backward, 'Invalid direction:', direction);
  console.log('_doOffer');

  if (checkConnectionsLimit()) { return; }

  if ( direction.forward ) {
    localMedia.start( connOffer );
  } else {
    connOffer();
  }
}

function doOffer(remoteUserObj) {
  //btnCallRemote.disabled = true;
  //btnHangup.disabled     = false;
  if ( MSG_DO_OFFER ) { wrtcChat.addSystem(MSG_DO_OFFER.formatObj(remoteUserObj)); }

  _doOffer(MEDIA_TYPE.VIDEO, '1', VIDEO1_DIRECTIONS, localVideo1, remoteUserObj);
}

/**
 * @param {ConnectionUser} remoteUserObj
 */
function doOffer2(remoteUserObj) {
  //btnCallRemote2.disabled = true;
  //btnHangup.disabled      = false;

  _doOffer(MEDIA_TYPE.VIDEO, '2', VIDEO2_DIRECTIONS, localVideo2, remoteUserObj);
}

/**
 * @param {ConnectionUser} remoteUserObj
 */
function doOfferScreen(remoteUserObj) {
  if ( SCREEN_DIRECTIONS.forward ) {
    createScreen1();
  }

  _doOffer(MEDIA_TYPE.SCREEN, 'Screen', SCREEN_DIRECTIONS, localScreen1, remoteUserObj);
}

/**
 *
 * @type {string}
 * @const
 */
var MSG_DO_ANSWER = MSG_DO_OFFER;

/**
 *
 * @param mediaType
 * @param {MEDIA_DIRECTION} direction
 * @param connId
 * @param localMedia
 * @param {ConnectionUser} remoteUserObj
 * @param rdesc
 * @private
 */
function _doAnswer(mediaType, direction, connId, localMedia, remoteUserObj, rdesc) {

  function connAnswer() {
    peerConnections.answer(mediaType, direction, connId, localMedia, wrtc.localUser.getUser(), remoteUserObj, rdesc);
  }

  assert(direction.forward || direction.backward, 'Invalid direction:', direction);

  if ( direction.backward ) {
    localMedia.start( connAnswer );
  } else {
    connAnswer();
  }
}

/** Собственно функция формирования AnswerSDP очень похожа на предыдущую, за исключением того, что сначала
 * мы отдадим методу setRemoteDescription полученный Offer SDP, а затем – готовый Answer SDP перешлем назад
 * (метод createOffer объявлен в adapter.js):
 *
 * @param {ConnectionUser} remoteUserObj
 * @param connId
 * @param rdesc
 */
function doAnswer(remoteUserObj, connId, rdesc) {
  //btnCallRemote.disabled = true;
  //btnHangup.disabled     = false;

  // !!! This check is a workaround as we do not send Offer2 message and do not want to send text twice
  if (remoteVideos.count() === 0 ) {
    if ( MSG_DO_ANSWER ) {
      wrtcChat.addSystem( MSG_DO_ANSWER.formatObj(remoteUserObj));
    }
  }

  _doAnswer(MEDIA_TYPE.VIDEO, VIDEO1_DIRECTIONS, connId, localVideo1, remoteUserObj, rdesc);
}

/**
 *
 * @param {ConnectionUser} remoteUserObj
 * @param connId
 * @param rdesc
 */
function doAnswer2(remoteUserObj, connId, rdesc) {

  //btnCallRemote2.disabled = true;
  //btnHangup.disabled      = false;

  _doAnswer(MEDIA_TYPE.VIDEO, VIDEO2_DIRECTIONS, connId, localVideo2, remoteUserObj, rdesc);
}

/**
 *
 * @param {ConnectionUser} remoteUserObj
 * @param {string} connId
 * @param rdesc
 */
function doAnswerScreen(remoteUserObj, connId, /*remoteUsername,*/ rdesc) {

  _doAnswer(MEDIA_TYPE.SCREEN, SCREEN_DIRECTIONS, connId, localScreen1, remoteUserObj, rdesc);
}

/**
 * @type {string}
 * @const
 */
//var MSG_DO_HANGUP_ALL = 'User is Offline'; // 'Hangup all...<br/>';
var MSG_DO_HANGUP_ALL = 'All users are Offline';
/**
 * @type {string}
 * @const
 */
//var MSG_DO_HANGUP_FROM_REMOTE    = MSG_DO_HANGUP_ALL; // 'Hangup connection from remote.<br/>;
var MSG_DO_HANGUP_FROM_REMOTE    = '{name} is Offline';
/**
 * @const
 * @type {boolean}
 */
var FLAG_STOP_LOCAL_ON_NO_REMOTE = false;

function setHangupStates() {
  if (getUrlFilename() === PAGE_PATIENT) {
    setStates( BUTTON_STATES.PATIENT_LOAD );

  } else if (getUrlFilename() === PAGE_PHYSICIAN) {
    setStates( BUTTON_STATES.PHYSICIAN_LOAD );

  } else if (getUrlFilename() === PAGE_GENERIC) {

    if (  document.getElementById('action').value === 'joinRoom') {
      setStates( BUTTON_STATES.GENERIC_REMOTE_MEET );

    } else {
      setStates( BUTTON_STATES.GENERIC_2 );
    }
  }
}

/**
 * Hangup all connections initiated by local side
 */
function doHangupAll() {
  debug.log('doHangupAll()');
  if (MSG_DO_HANGUP_ALL) { wrtcChat.addSystem(MSG_DO_HANGUP_ALL); }

  peerConnections.hangupFromLocalAll();

  // Если больше соединений не осталось, завершим локальное видео
  if ( FLAG_STOP_LOCAL_ON_NO_REMOTE && remoteVideos.count() === 0) {
    doHangupLocalMedia();
  }

  setHangupStates();
}

/**
 * Process Hangup from Remote User
 *
 * @param {ConnectionUser} remoteUser     - Remote User Object {id,name} which sent Hangup
 * @param {string|null} connId  - Connection Id or null to Hangup all Connection to this User
 */
function doHangupFromRemote(remoteUser, connId) {
  debug.log('doHangupFromRemote(): remoteUser:', remoteUser, '; connId:', connId);
  if ( MSG_DO_HANGUP_FROM_REMOTE ) { wrtcChat.addSystem( MSG_DO_HANGUP_FROM_REMOTE.formatObj(remoteUser) ); }
  if (!remoteUser) { debug.error('doHangupFromRemote(): Invalid remoteUser.'); }

  peerConnections.hangupFromRemote(remoteUser, connId);

  // Если больше соединений не осталось, завершим локальное видео
  if ( FLAG_STOP_LOCAL_ON_NO_REMOTE && remoteVideos.count() === 0) {
    doHangupLocalMedia();
  }

}

/**
 *
 */
function doHangupLocalMedia() {
  debug.log('doHangupLocalMedia()');
  if (localVideo1 && localVideo1.isStarted() ) {
    localVideo1.stop();
  }
  if (localVideo2 && localVideo2.isStarted() ) {
    localVideo2.stop();
  }
  if (localScreen1 && localScreen1.isStarted() ) {
    localScreen1.stop();
  }
  btnCallRemote.disabled = false;
  btnHangup.disabled     = true;
}

