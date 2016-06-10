'use strict';

function initUserListStatus(listSelector, templateId) {

  var templates = {
    default: { id: templateId } // 'userlist-user-default-template' }
  };

  loadTemplates(templates);

  function addUserEvent(userId, selector, handler) {
    $(listSelector+' *[data-user-id="' + userId+ '"] ' + selector).click( function(e) {
      console.log('addUserEvent click userId:', userId, '; selector:', selector);

      handler(userId);
      e.preventDefault();
      //return false;
    });
  }

  wrtc.userList.on('add', function (user, status) {
    console.log('userList.on(\'add\')');

    // Check user validity
    if (!user.id) {
      debug.warn('userList.on(\'add\'): invalid user object:', user);
      return;
    }
    // Add to the list
    var $userList = $(listSelector);
    var html = templates['default'].compiled(user);
    //console.log('userList.on(\'add\'): html:', html);
    $userList.append(html);


    // actions for the user in the list

    //$('*[data-user-id="' + user.id + '"] .start-call-action').click(function () {
    //  wrtc.inviteNew(user.id);
    //});
    addUserEvent(user.id, '.start-call-action', wrtc.inviteNew);

    //$('*[data-user-id="' + user.id + '"] .start-chat-action').click(function () {
    //  wrtc.inviteTextChat(user.id);
    //});
    addUserEvent(user.id, '.start-chat-action', wrtc.inviteTextChat);

    //$('*[data-user-id="' + user.id + '"] .add-call-action').click(function () {
    //  wrtc.inviteTextChat(user.id);
    //});
    addUserEvent(user.id, '.add-call-action', wrtc.inviteExisting);

    // Set number of users
    $('.number-presenters').text(wrtc.userList.length);
  });


  wrtc.userList.on('remove', function (user) {
    console.log('userList.on(\'remove\')');

    // Check user validity
    if (!user.id) {
      debug.warn('userList.on(\'add\'): invalid user object:', user);
      return;
    }
    // Remove element from the list
    $('*[data-user-id="' + user.id + '"]').remove();

    // Set number of users
    $('.number-presenters').text(wrtc.userList.length);
  });


}
