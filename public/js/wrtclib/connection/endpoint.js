/**
 * Created by alykoshin on 3/21/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('./../../mylib/utils.js').debug;
  var Connection = require('./connection.js');
}

/**
 *    local endpoints              remote endpoints
 * /-------------------\         /-------------------\
 *
 *           /---connId1 - - - - connId1---\
 *           |                             +---userId2
 *           +---connId2 - - - - connId2---/
 * userId1---+
 *           +-- connId3 - - - - connId3---\
 *           |                             +---userId3
 *           \-- connId4 - - - - connId4---/
 *
 * [                     <-- [invite]   ]
 *   hello / helloScreen -->
 *                       <-- offer / offerScreen
 *   answer/answerScreen -->
 *                       <-- ice
 *                   ice -->
 *
 */

'use strict';

var peerConnections = (function() {
  var that = {};

  Emitter(that);

  /**
   * Active connections array
   * @type {{}}
   */
  var pcs = {};

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /** Создание объекта RTCPeerConnection
   * Непосредственно при создании RTCPeerConnection добавим к нему
   * локальный медиа-поток, создадим HTML видео-элемент,
   * зададим объявленные выше обработчики событий onicecandidate и onaddstream
   * и добавим в массив соединений
   *
   * @param mediaType
   * @param direction
   * @param {string} connId
   * @param localMedia
   * @param {ConnectionUser} localUserObj
   * @param {ConnectionUser} remoteUserObj
   * @returns {Connection}
   */
  that.add = function(mediaType, direction, connId, localMedia, localUserObj, remoteUserObj) {

    /**
     * При получении нового ICE-кандидата просто отправим его другому участнику соединения.
     *
     * @param {RTCIceCandidate} cand
     */
    function onIceCandidate(cand) {
      if (cand) {
        debug.log('pc.onIceCandidate(): cand: \''+ cand.candidate.replace('\r\n', '') +'\'', cand);
        //sendIce(remoteUserObj, connId, cand); // remoteUserId содержит идентификатор дальней стороны
        wrtc.sendEvent(MESSAGES.WEBRTC_ICE, remoteUserObj, connId, cand);
      }
    }

    function onCreateOfferSuccess(ldesc) {
      var action;
      if (mediaType === MEDIA_TYPE.VIDEO) {
        action = MESSAGES.WEBRTC_OFFER;
      } else {
        action = MESSAGES.WEBRTC_OFFER_SCREEN;
      }

      //sendOffer(action, remoteUserObj, connId, localUserObj, ldesc);
      wrtc.sendEvent(action, remoteUserObj, connId, ldesc);

      var conn = pcs[connId];
      conn.addIceBuffer(iceBuffer, connId);

      debug.info('Offer sent. Waiting for the answer from remote...');
    }

    function onCreateError(error) {
      debug.error('onCreateError(): error:', error);
      messageWrtc('Connection error',
        'Error during establishing connection',
        'peerConnections.offer/answer()',
        error);
    }

    function onCreateAnswerSuccess(ldesc) {
      debug.log('peerConnections.answer(): success(); sdp: \n'+ldesc.sdp+' ldesc: ', ldesc);
      //sendAnswer(MESSAGES.WEBRTC_ANSWER, remoteUserObj, connId, localUserObj, ldesc);
      wrtc.sendEvent(MESSAGES.WEBRTC_ANSWER, remoteUserObj, connId, ldesc);
      var conn = pcs[connId];
      conn.addIceBuffer(iceBuffer, connId);
      debug.info('Answer sent. Waiting for the media from remote...');
    }


    debug.log('peerConnections.add(): mediaType:', mediaType, '; direction:', direction,
      '; remoteUserObj:', remoteUserObj, '; connId:', connId, '; localMedia:', localMedia);

    MEDIA_TYPE.check(mediaType);

    var c = new Connection( {
      rtcConfiguration: rtcConfiguration,
      bandwidth       : option_bw,
      mediaType       : mediaType,
      connId          : connId   // Connection ID is known after Offer/Answer handshake
      //      onIceCandidate:   onIceCandidate,
      //      onOfferSuccess:   onOfferSuccess,
      //      onOfferError:     onOfferError,
      //      onAnswerSuccess:  onAnswerSuccess,
      //      onAnswerError:    onAnswerError
    } );

    c.onCreateOfferSuccess  = onCreateOfferSuccess;
    c.onCreateOfferError    = onCreateError;
    c.onCreateAnswerSuccess = onCreateAnswerSuccess;
    c.onCreateAnswerError   = onCreateError;
    c.onIceCandidate        = onIceCandidate;

    c._media_was_connected = false;

    c.on('iceConnectionStateChange', function(iceConnectionState, iceGatheringState) {
      /*
       * enum RTCIceConnectionState {
       *   "new",
       *   "checking",
       *   "connected",
       *   "completed",
       *   "failed",
       *   "disconnected",
       *   "closed"
       * };
       *
       * enum RTCIceGatheringState {
       *   "new",
       *   "gathering",
       *   "complete"
       * };
       */
      that.emit('iceConnectionStateChange', c, iceConnectionState, iceGatheringState);

      if (iceConnectionState === 'connected' ) { // Connection was established
        that.emit('media_connect', c);

        if (!c._media_was_connected) {
          c._media_was_connected = true;
          that.emit('media_start', c);
        } else {
          that.emit('media_continue', c);
        }

      } else if (iceConnectionState === 'disconnected') { // Media connection was lost
        that.emit('media_stop', c);

      } else if (iceConnectionState === 'failed') {       // We were not able to establish connection
        that.emit('media_fail', c);
      }

    });

    c.on('close', function(conn) { that.emit('close', conn); });

    /** @type {ConnectionUser} */
    c.localUser  = localUserObj;
    /** @type {ConnectionUser} */
    c.remoteUser = remoteUserObj;

    if (direction.forward) {
      if (localMedia && localMedia.stream) {
        debug.log('peerConnections.add(): Adding localMedia', localMedia);
        c.addLocalStream(localMedia.stream);       // Add local stream to the connection
        c.lvid = localMedia.vid;
        // debug.log( 'peerConnections.add(): pc.getLocalStreams():', c.peerConnection.getLocalStreams() );
      } else {
        debug.warn('peerConnections.add(): no localMedia');
      }
    } else {
      c.lvid = null;
    }

    if (direction.backward) {
      c.rvid = remoteVideos.add(mediaType, connId);

      c.showUserInfo(  ); // remoteUserObj.name );
    } else {
      c.rvid = null;
    }

    pcs[connId] = c;
    return c;
  };


  function addIceBuffer(connId) {
    var c = pcs[connId];
    c.addIceBuffer(iceBuffer, connId);
  }

  that.offer = function(mediaType, offerId, direction, localMedia, localUserObj, remoteUserObj/*, successCb, errorCb*/) {
    var connId, c;
    debug.log('peerConnections.offer(): mediaType', mediaType, '; remoteUserObj.id:', remoteUserObj.id, '; localMedia:', localMedia);
    MEDIA_TYPE.check(mediaType);

    //  Check the number of current videos
    //      if (remoteVideos.count() >= 2) {
    //        debug.log('peerConnections.offer(): Offer ignored: Too many videos already active.');
    //        return;
    //      }

    connId = genStrId();
    c = that.add(mediaType, direction, connId, localMedia, localUserObj, remoteUserObj ); //self.find(remoteUserId); // Find
    //      socket.emit('setConnId', connId); // Set connId for socket from Node.js side to send hangup in the future
    //    that.successCbOffer = successCb;
    c.createOffer();
  };

  that.answer = function(mediaType, direction, connId, localMedia, localUser, remoteUser, rdesc/*, successCb, errorCb*/) {
    var dir, c;
    debug.log('peerConnections.answer(s): mediaType', mediaType, '; remoteUser.id:', remoteUser.id, '; connId:', connId, '; localMedia:', localMedia, '; rdesc:', rdesc);
    MEDIA_TYPE.check(mediaType);

    // for the Answer the direction is opposite
    // (we assume direction is from offer to answer, but now it is backward
    dir = {};
    dir.forward  = direction.backward;
    dir.backward = direction.forward;

    //    debug.log('!!!!!!!!! answer: add>>>');
    c = that.add(mediaType, dir, connId, localMedia, localUser, remoteUser );

    c._setRemoteDescription(rdesc);
    c.createAnswer();
  };

  /**
   *  @typedef {{string}} ConnId
   */

  /**
   * Removal of RTCPeerConnection:
   *
   * @param {ConnId} id
   */
  that.delByConnId = function(id) {
    if ( pcs[id] ) {
      pcs[id].cleanup();
      delete pcs[id];  // ...and remove from associative array
    }
  };

  /**
   *
   * @param {ConnId} id
   * @returns {*}
   */
  that.find = function(id) {
    return pcs[id];
  };

  /**
   *
   * @param {ConnId} id
   * @returns {boolean}
   */
  that.exists = function(id) {
    return !!pcs[id];
  };

  that.addIce = function(connId, ice) {
    var c = that.find(connId);
    debug.log('peerConnections.addIce: connId: ' + connId +'; ice: ' + JSON.stringify(ice) );
    if ( c ) {                      // PeerConnection for this connId is already created
      c.addIceCandidate(ice);       // Passing it to connection object
    } else {                        // PeerConnection for this connId is not yet exists
      iceBuffer.add( connId, ice ); // Storing it to iceBuffer
    }
  };

  that.setRDesc = function(connId, desc) {
    var c = this.find(connId);
    c.setRDesc(desc);
  };

  that.setLDesc = function(id, desc) {
    var c = this.find(id);
    c.setLDesc(desc);
  };

  that.onAnswerReceived = function( connId, remoteUser, desc ) {
    var c = that.find( connId );
    desc.sdp = sdp_sendonly2sednrecv(desc.sdp);
    that.setRDesc(connId, desc);

    // Store remote user information
    c.remoteUser = remoteUser;

    c.showUserInfo();
  };

  // If specific connection set, hangup only this one
  that._hangupLocalEndByConnId = function(connId) {
    debug.log('peerConnections._hangupLocalEndByConnId(): connId:', connId);
    remoteVideos.delByConnId(connId);
    that.delByConnId(connId);
  };

  // 'connId' is not set - Hangup all connections from remote user
  that._hangupLocalEndByUserId = function(remoteUserId) {
    for ( var id in pcs ) {   // Iterate through each PeerConnection
      debug.log('peerConnections._hangupLocalEnd(): iterating: remoteUserId:', remoteUserId);
      if ( pcs.hasOwnProperty(id) && pcs[id].remoteUser.id === remoteUserId ) { //
        debug.log('peerConnections._hangupLocalEnd(): found: remoteUserId:', remoteUserId);
        remoteVideos.delByConnId( id );
        that.delByConnId( id );
      }
    }
  };

  that._hangupLocalEnd = function(remoteUser, connId) {
    debug.log('peerConnections._hangupLocalEnd(): ');
    // If specific connection set, hangup only this one
    // usually it is initiated by local user
    if (connId) { that._hangupLocalEndByConnId(connId); }
    // 'connId' is not set - Hangup all connections from remote user
    // usually it is initiated by server on remote user websocket disconnect
    else { that._hangupLocalEndByUserId(remoteUser.id); }

    that.emit('hangup', 'local', remoteUser);
  };

  that._hangupRemoteEnd = function(remoteUser, connId) {
    debug.log('peerConnections._hangupRemoteEnd(): ');

    wrtc.sendEvent(MESSAGES.HANGUP, remoteUser, connId, null);
    that.emit('hangup', 'remote', remoteUser);
  };

  /**
   * Hangup was received from remote, we need to release local end
   *
   * @param {ConnectionUser} remoteUser
   * @param {ConnId} connId
   */
  that.hangupFromRemote = function(remoteUser, connId) {
    debug.log('peerConnections.hangupFromRemote(): ');

    that._hangupLocalEnd(remoteUser, connId);
    that.emit('hangup', 'remote', remoteUser);
  };

  /**
   * Hangup initiated by local side, need to release local and remote ends
   *
   * @param {ConnectionUser} remoteUser
   * @param {ConnId} connId
   */
  that.hangupFromLocal = function(remoteUser, connId) {
    debug.log('peerConnections.hangupFromLocal(): ');

    that._hangupLocalEnd(remoteUser, connId);
    that._hangupRemoteEnd(remoteUser, connId);
  };

  /**
   *
   */
  that.hangupFromLocalAll = function() {
    var id;
    debug.log('peerConnections.hangupFromLocalAll(): ');
    for ( id in pcs ) {   // will go through all active connections
      if (pcs.hasOwnProperty(id)) {

        that.hangupFromLocal(pcs[id].remoteUser, pcs[id].connId/*, true*/); /** and hangup each of them **/
      }
    }
  };

  /** iterate through all connections
   * and hangup all with
   * - localMediaIndex: "2"
   * - or:  mediaIndex: "2"
   * - mediaType: "VIDEO"
   *
   * @param mediaType
   * @param mediaIndex
   */
  that.hangupFromLocalByMedia = function(mediaType, mediaIndex) {
    var pc, id;
    debug.log('peerConnections.hangupFromLocalByMedia(): mediaType:', mediaType, '; mediaIndex:', mediaIndex);
    for ( id in pcs ) {   /** will go through all active connections **/
      if (pcs.hasOwnProperty(id)) {
        pc = pcs[id];
        if (pc.lvid) {
          debug.log('peerConnections.hangupFromLocalByMedia(): pc.lvid: ', pc.lvid);
          debug.log('peerConnections.hangupFromLocalByMedia(): pc.lvid.mediaType:', pc.lvid.mediaType, '; pc.lvid.mediaIndex:', pc.lvid.mediaIndex);
          if (pc.lvid.mediaType === mediaType && pc.lvid.mediaIndex == mediaIndex) {
            debug.log('peerConnections.hangupFromLocalByMedia(): pc.lvid.mediaType:', pc.lvid.mediaType, '; pc.lvid.mediaIndex:', pc.lvid.mediaIndex);

            that.hangupFromLocal(pc.remoteUser, pc.connId/*, true*/); /** and hangup each of them **/
          }
        }
      }
    }
  };

  /**
   *
   * @returns {number}
   */
  that.count = function() {
    return Object.size(pcs);
  };

  /**
   * To give access to PeerConnection array
   *
   * @returns {{}}
   */
  that.pcs = function() {
    return pcs;
  };

  return that;
}());

if (typeof module !== 'undefined') {
  module.exports = peerConnections;
}

if (typeof window !== 'undefined') {
  window.peerConnections  = peerConnections;
}
