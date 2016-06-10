/**
 * Created by alykoshin on 3/22/14.
 */

"use strict";

var wrtcChat = function() {

  var that = {};

  /**
   * Public fields
   */
  that.onSend = null;  /** Callback to send the message **/

  /**
   * Private fields
   **/
  var log    = document.getElementById('wrtcChatLog');
  var scroll = document.getElementById('wrtcChatScroll');
  scroll = scroll || log;
  var input  = document.getElementById('wrtcChatInput');
  var btn    = document.getElementById('wrtcChatButton');

  /**
   * Private functions - event handling
   **/

  function inputKeyPress(event) {
    if (event.which === 13) {
      sendButtonClick();
    }
  }

  /** Send new message to chat **/
  function sendButtonClick() {
    // var input = document.getElementById('chat_input');
    /** Send to remote **/
    if (that.onSend) { that.onSend(input.value); }
    //wrtc.sendEvent('text', null, null, escape(input.value));
    /** Add text to chat log **/
    that.addLocal( input.value );
    /** Clear input line **/
    input.value = '';
  }

  /**
   * Assigning event handlers to HTML elements
   */
  input.onkeypress = inputKeyPress;
  btn.onclick      = sendButtonClick;

  /**
   * Private functions
   **/

  function add(html) {
    // Add new text
    log.innerHTML += html;
    //log.appendChild(html);

    // Scroll log to the end
    scroll.scrollTop = scroll.scrollHeight;

    if ($ && $('.chatting-position')) {
      $('.chatting-position').mCustomScrollbar('update');
      $('.chatting-position').mCustomScrollbar('scrollTo', 'bottom');
    }
  }


  var templates = {
    local:  { id: 'chat-msg-local-template' },
    remote: { id: 'chat-msg-remote-template' },
    system: { id: 'chat-msg-system-template' }
  };
  loadTemplates(templates);

  /**
   *
   * @param {string} type - 'Local'|'Remote'|'System' - Local / Remote / System -> determines class wrtcLocal, wrtcRemote, wrtcSystem
   * @param text
   * @param {object} user
   */
  function addMessage(type, text, user) {

    function curTimeString() {
      //return (new Date().toUTCString().match(/(\d\d:\d\d:\d\d)/)[0]);
      return Date().match(/(\d\d:\d\d):\d\d/)[1];
    }

    var html = templates[type].compiled( {
      //className: className,
      user:  user,
      text:  text,
      type:  type,
      time: curTimeString()
    } );

    //debug.log('addMessage(): html:', html);

    that.add(html);
  }

  /*
   * Public functions
   */

  that.add = function(text) {
    add(text);
  };

  that.addRemote = function(user, text) {
    addMessage( 'remote', text, user);// ? user.name : null );
  };

  that.addLocal = function(text) {
    var user = wrtc.localUser.getUser();
    addMessage( 'local', text, user);//.name ? user.name : user.id );
  };

  that.addSystem = function(text) {
    addMessage( 'system', text );
  };

  that.clear = function () {
    log.innerHTML = '';
  };

  /*
   * End of object definition
   */

  return that;

}();
