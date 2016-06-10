'use strict';

var CONFIG = require('../public/common/app_config.js');

var crypto = require('crypto');

////////////////////////////////
// Based on
// https://github.com/andyet/signalmaster/blob/master/server.js
//

function createTurnCredential(serverSecret, serverExpiry) {
  var hmac = crypto.createHmac('sha1', serverSecret);
  // default to 86400 seconds timeout unless specified
  var username = new Date().getTime() + (serverExpiry || 86400) + "";
  hmac.update(username);
  return {
    username: username,
    credential: hmac.digest('base64')
  };
}
////////////////////////////////

/*
 //var cred = createTurnCredential( 'ABCDEF', null );
 var cred = { username: 'demo', credential: 'testing' };
 //var turn_url  = "telmed.wellstats.com:3478";
 var turn_hostname  = 'telmed.wellstats.com';
 var turn_port = '3478';
 */

//[
//  { "url": "stun:stun.stunprotocol.org:3478"            }
//  { "url": "stun:stun.l.google.com:19302"               }
//  { "url": "turn:demo@wrtc.ru", "credential": "testing" }

//{ url: "turn:"+cred.username+"@"+turn_url, credential: cred.credential }

//   CONFIG.TURN.SERVERS

/*    {
 protocol: 'turn',
 hostname: turn_hostname,
 port:     turn_port,
 username: cred.username,
 password: cred.credential
 }  */
//  { url: "turn:"+turn_url, username:   cred.username, credential: cred.credential }
//{ url: "url", credential: "cred" }
//]

/*
 * WebRTC Trickle ICE Test Page
 * https://webrtc.googlecode.com/svn/trunk/samples/js/demos/html/ice-servers.html
 */



module.exports.getIceServers = function() { return CONFIG.TURN.SERVERS; };
