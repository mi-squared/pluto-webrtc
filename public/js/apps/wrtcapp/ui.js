/**
 * Event handlers
 */

  // Init event handlers on document.ready()
//$(function() {

// List for load complete
//document.addEventListener('wrtc-load-finished', function(e) {
document.addEventListener('wrtc-init-finished', function(e) {

  var wrtcUI = {};

  function addParticipantClick (sender) {
    var uid = document.getElementById('inputUserId').value;
    //sendInvite(uid);
    wrtc.addParticipant(uid);
  }

  $('#btnStartLocal').click(function (sender) {
    localVideo1.start();
  });

  $('#btnStartLocal2').click(function (sender) {
    MediaSources.applySources(2, localVideo2);
    localVideo2.start();
  });

  $('#btnStartLScreen').click(function (sender) {
    createScreen1();
    localScreen1.start();
  });

  $('#btnCallRemote').click(function (sender) {
    localVideo1.start(wrtc.hello);
  });

  $('#btnCallRemote2').click(function (sender) {
    if (!localVideo2) {
      createLocalVideo2();
    }
    MediaSources.applySources(2, localVideo2);
    localVideo2.start(doHelloVideo2_0);
  });

  $('.wrtcHangupAllAction').click(function () {
    doHangupAll();
  });

  //addEventByClass(document, 'wrtcLocalSpeakerBtn', 'click', function(event) {
  $('.wrtcLocalSpeakerBtn').click(function (event) {
    $(this).toggleClass('off');
    remoteVideos.toggleMuted();
    //event.preventDefault(); event.stopPropagation();
  });

  $('.wrtcLocalVideoBtn').click(function (event) {
    $(this).toggleClass('off');
    LocalVideoHolder.toggleVideoEnabled();
    //event.preventDefault(); event.stopPropagation();
  });

  $('.wrtcHangupBtn').click(function (event) {
    $(this).toggleClass('off');
    LocalVideoHolder.toggleAudioEnabled();
    //event.preventDefault(); event.stopPropagation();
  });

  function showHideChat (show) {
    var div = $('.text_chat');

    if (show) {
      div.show();
      $('.notes').height('50%');

    } else {
      div.hide();
      $('.notes').height('100%');
    }

    // quick dirty fix for Health_VC
    if ($('.chatting-box')) {
      if (show) {
        $('.chatting-box').fadeIn('fast');
        $('.callign-section').addClass('width-505');
      } else {
        $('.chatting-box').fadeOut('fast');
        $('.callign-section').removeClass('width-505');
      }
    }

  }

  $('.wrtcShowHideChatAction').click(function () {
    //showHideChat( $('.text_chat').hasClass('display_none') );
    showHideChat($('.text_chat').css('display') === 'none');

  });

  $('.wrtcStartScreenBtn').click(function (event) {
    createScreen1();
    doHelloScreen0();
  });

  $('.wrtcRequestScreenBtn').click(function (event) {
    doHelloScreen();
  });

  $('.wrtcPreviewBtn').click(function (event) {
    $(this).toggleClass('off');
    //$('#wrtcLocalVideoHolder').toggleClass('display_none display_block');
    $('#wrtcLocalVideoHolder').toggleClass('display_none');
  });

  $(".chat").click(function(){
    $(".chatting-box").fadeToggle("fast");
    $(".callign-section").toggleClass("width-505");
  });

  wrtcUI.callTicker = new Ticker({}, function(timeStr) {
    $('.timerCounter').text(timeStr);
  });

  //

  wrtc.on([MESSAGES.WEBRTC_ANSWER, MESSAGES.WEBRTC_OFFER], function(data) {
    var fromUser = new wrtc.User(data.from);
    //wrtc.publish('busy');
    if (! wrtcUI.callTicker.active()) { wrtcUI.callTicker.start(); }
    //$('.calling-username').text(fromUser.getVisibleName());
    $('.overlay-disable').show();
  });

  // Show chat on incoming message
  wrtc.on(MESSAGES.TEXT, function (/*from,text*/) {
    showHideChat(true);
  });

  // On invitation to video conf ask the user and connect if confirmed
  wrtc.on(MESSAGES.INVITE_URL, function(data) {
    var MSG_WERE_INVITED = 'You were invited to Video Conference by <?= name ?>';

    var ok = confirm(  _.template(MSG_WERE_INVITED)({ name: data.from.name }) );
    if (ok) {
      var href = data.data.href;

      wrtc.join(data.roomId);
      wrtc.hello();
    }
  });

  // On invitation to text chat ask the user and connect if confirmed
  wrtc.on(MESSAGES.INVITE_TEXT_CHAT, function(data) {

    var MSG_WERE_INVITED = 'You were invited to Text Chat by <?= name ?>';
    var MSG_IS_ONLINE    = '<?= name ?> is online';

    var ok = confirm( _.template(MSG_WERE_INVITED)({ name: data.from.name }) );
    if (ok) {
      wrtc.roomId = data.roomId; // Set the global roomId we were invited to
      wrtc.join( data.roomId);

      var textRemote = _.template(MSG_IS_ONLINE)({ name: wrtc.localUser.getVisibleName() });
      wrtc.text(textRemote);

      var textLocal = _.template(MSG_IS_ONLINE)({ name: data.from.name });
      wrtcChat.addSystem(textLocal);
      wrtc.emit(MESSAGES.TEXT, null, textLocal); // dirty fix to open chat by imitating incoming text chat message
    }
  });


  peerConnections.on('hangup', function() {
    console.log('peerConnections.on(\'hangup\')');
    wrtcUI.callTicker.stop();
    wrtcUI.callTicker.reset();
    if (peerConnections.count() === 0) {
      $('.overlay-disable').hide();
    }
  });


  wrtcUI.otherUserDialog = initOtherUserDialog();

  $('.doctor .wrtcAddEmailClick').click(function() {
    wrtcUI.otherUserDialog.dialog('open');
  });

  initDialogUserListInvite('.dialog-cover .user-list', 'userlist-user-default-template-invite');

  $('.employee .wrtcAddEmailClick, .patient .wrtcAddEmailClick').click(function() {
    $('.dialog-invite-list').show();
  });

  initUserListStatus('.online-box .user-list', 'userlist-user-default-template');

  window.wrtcUI = wrtcUI;
});
