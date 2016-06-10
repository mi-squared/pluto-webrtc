/**
 * Created by alykoshin on 7/8/14.
 */

'use strict';

/**
 * http://tech.avivo.si/2011/01/javascript-alert-message-box-alternative/
 */
var messageBox = function(title, text, info) {
  var that = {};

  that.onClose = null;

  that.hide = function () {
    document.getElementById('wrtcMessageBoxParent').style.display = 'none';
  };

  var
    STYLE_PARENT ='' +
      'position: absolute; left: 0; top: 0; height: 100%; width:100%;'+
      '-webkit-transform-style: preserve-3d;'+
      '-moz-transform-style:    preserve-3d;'+
      'transform-style:         preserve-3d;' +
      'z-index: 2147483647;' +
      'background-color: rgba(215, 215, 215, 0.5);'+
      '',
    STYLE = 'style = "'+
      'position: absolute; ' +
      //'z-index: 2147483647;' +
      'left: 25%; ' +
      'right: 25%; ' +
      'border: 2px outset #ccc;' +
      'background-color: #eee; ' +
      // Horizontal alignment
      // http://zerosixthree.se/vertical-align-anything-with-just-3-lines-of-css/
      'top: 50%;' +
      'transform:         translateY(-50%);' +
      '-webkit-transform: translateY(-50%);' +
      '-ms-transform:     translateY(-50%);' + // Works in IE9+
      //
      '"',
    STYLE_DIV_1 = 'style="' +
      'background-color: #81B1E1; '+//#5d5d92;' +
      'color:#fff;' +
      'font-weight:bold; ' +
      'padding-left:5px;' +
      '"',
    STYLE_DIV_2 =  'style="' +
      'font-weight:bold; ' +
      'padding:15px;' +
      '"',
    STYLE_DIV_3 =  'style="' +
      'position: relative;' +
      'padding: 5px;'+
      'margin: 0px 5px;'+
      'border: 1px solid grey;'+
      'font-size:12px;' +
      'text-align: left;' +
      'background-color: rgb(248, 248, 248);' +
      'font-family: \'Courier New\', \'Lucida Console\', Monospace;' +
      '"',
    STYLE_BUTTON = 'style="' +
//      'padding-left: 24px; ' +
//      'padding-right:24px; ' +
//      'padding-top:5px;' +
        'margin-top: 20px;' +
        'margin-bottom: 20px;' +
      '"';

  function hideMessageBox(ev) {
    //console.log(ev);
    if ( (ev.type === 'keydown' && ev.keyCode === 27) || (ev.type === 'click') ) {
      that.hide();
      if (that.onClose) { that.onClose(); }
    }
  }

  // Text is still ok to printout to console
  debug.warn('messageBox():\n title:', title, '\n text:', text, '\n info:', info);

  title = title ? title : 'Message title';
  text  = text  ? text  : 'Message text';
  info  = info  ? 'Technical info:<br /><hr>' + info : null;

  // Replace EOLs with '<br />' to prepare for HTML
  text  = text  ? text.replace(/\n/g,'<br />') : '';
  info  = info  ? info.replace(/\n/g,'<br />') : '';


  var template =
    '<center><div id="wrtcMessageBox"  tabindex="1" ' + STYLE + '>' +
      '<div id="wrtcMessageBox1" ' + STYLE_DIV_1 + '></div>' +
      '<div id="wrtcMessageBox2" ' + STYLE_DIV_2 + '></div>' +
      '<div id="wrtcMessageBox3" ' + STYLE_DIV_3 + '></div>' +
      '<input type="button" id="wrtcMessageBoxOk" '+STYLE_BUTTON+' value="    OK    " '+
        ' />' +
      '<br/>' +
      '</div>' +
    '</center>';

  if (! document.getElementById('wrtcMessageArea')) {
    /** Else create the element before writing the data. **/

    var div = document.createElement('div');
    div.setAttribute('id', 'wrtcMessageArea');
    div.innerHTML = template;

    var parent = document.createElement('div');
    parent.setAttribute('id', 'wrtcMessageBoxParent');
    parent.setAttribute('style', STYLE_PARENT);
    parent.appendChild(div);

    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(parent, body.firstChild);
    //OR body.appendChild(div); //This will insert the message box at the end of the page.

    /** Not even trying to support IE < v9 (attachEvent) **/
    document.getElementById('wrtcMessageBoxOk').addEventListener('click',   hideMessageBox, true);
    document.getElementById('wrtcMessageBox'  ).addEventListener('keydown', hideMessageBox, true);
  }

  //If the 'print_area' exists, just write our data into it.
  document.getElementById('wrtcMessageBox1').innerHTML = title;
  document.getElementById('wrtcMessageBox2').innerHTML = '<h3>' + text + '</h3>';
  document.getElementById('wrtcMessageBox3').innerHTML = info ;
  document.getElementById('wrtcMessageBox3').style.visibility   = info ? 'visible' : 'hidden';
  document.getElementById('wrtcMessageBoxParent').style.display = 'block';
  document.getElementById('wrtcMessageBoxOk').focus();

  return that;
};

function errorToString( errorObject ) {
  var s = '';
  /** Behaviour of Firefox and Chrome is different **/
  if (typeof errorObject === 'string') { /** Firefox returns error string **/
    s = '\'' + errorObject + '\'';
  } else {                               /** Chrome returns error object **/
    for (var prop in errorObject) {
      if (errorObject.hasOwnProperty(prop)) {
        s += '\n' + '&nbsp;' + '&nbsp;' + prop + ': \'' + errorObject[prop] +'\', ';
      }
    }
    if (s.length > 0 ) { s = s.split(0, -2); }
    s = '{' + s + '\n}';
  }
  return s;
}

var messageWrtc = function(title, text, procedure, errorObject) {
  return messageBox(
    title,
    text,
    (procedure ? 'Procedure: ' + procedure + '\n' : '') +
      (errorObject) ? ' errorObject: ' +errorToString(errorObject) : ''
  );
};

/** Try to override default 'alert' function **/
var window_alert = window.alert;
window.alert = function(text) {
  messageBox('Alert', text);
};
/**********************************************/

// messageBox('messageBox Title', 'Main message text', 'Additional info - line 1\nline2\nline 3');
