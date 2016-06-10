/**
 * Created by alykoshin on 9/30/14.
 */

"use strict";

var InlineInstall = function() {
  var self = this;

  var linkToExtension = 'https://chrome.google.com/webstore/detail/aelbdcldkphomhofiomjphfjpdpncfkc';

  self._request = function (text, buttonText, onClick) {
    var w = window;
    var i = document.createElement('iframe');
    i.style.position = 'fixed';
    i.style.top = '-41px';
    i.style.left = 0;
    i.style.right = 0;
    i.style.width = '100%';
    i.style.height = '40px';
    i.style.backgroundColor = '#ffffe1';
    i.style.border = 'none';
    i.style.borderBottom = '1px solid #888888';
    i.style.zIndex = '9999999';
    if(typeof i.style.webkitTransition === 'string') {
      i.style.webkitTransition = 'all .5s ease-out';
    } else if(typeof i.style.transition === 'string') {
      i.style.transition = 'all .5s ease-out';
    }
    document.body.appendChild(i);
    var c = (i.contentWindow) ? i.contentWindow :
      (i.contentDocument.document) ? i.contentDocument.document : i.contentDocument;
    c.document.open();
    c.document.write('<span style="font-family: Helvetica, Arial,' +
      'sans-serif; font-size: .9rem; padding: 7px; vertical-align: ' +
      'middle; cursor: default;">' + text + '</span>');
    if(buttonText && onClick) {
      c.document.write('<button id="okay">' + buttonText + '</button><button>Cancel</button>');
      c.document.close();
      c.document.getElementById('okay').addEventListener('click', function(e) {
        // window.open(buttonLink, '_top');

        if (onClick) { onClick()}

        e.preventDefault();
        try {
          event.cancelBubble = true;
        } catch(error) { }
      });
    }
    else {
      c.document.close();
    }
    c.document.addEventListener('click', function() {
      w.document.body.removeChild(i);
    });
    setTimeout(function() {
      if(typeof i.style.webkitTransform === 'string') {
        i.style.webkitTransform = 'translateY(40px)';
      } else if(typeof i.style.transform === 'string') {
        i.style.transform = 'translateY(40px)';
      } else {
        i.style.top = '0px';
      }
    }, 300);
  };

  self.init = function() {

  };


  var successCallback = function () {
    location.reload();
  };

  var failureCallback = function (error) {
    alert(error);
  };

  var action = function() {
    !!navigator.webkitGetUserMedia
      && !!window.chrome
      && !!chrome.webstore
      && !!chrome.webstore.install &&
    chrome.webstore.install(
      linkToExtension,
      successCallback,
      failureCallback
    );
  };


  self.check = function () {
    //return chrome && chrome.app && chrome.app.isInstalled;
    DetectRTC.screen.isChromeExtensionAvailable( function(res) {
      if (!res) {
        self._request('This site requires Chrome Extension to be installed for Screen Sharing',
          'Install Extension', action);
      }
    } );
  };

  return self;
};
