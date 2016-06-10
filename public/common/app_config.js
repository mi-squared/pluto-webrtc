/**
 * Created by alykoshin on 6/30/14.
 */

//require('./webrtc/mylib/utils.js');

var CONFIG = {
  USE_SSL    :  false, //true, //false, //true, // false
  CERTIFICATE: {
    /** Paths and file names for certificates for SSL
     * (PATH needs to have trailing '/') **/

//  PATH: '../ssl/telmed.wellstats.com/',KEY:'telmed.wellstats.com.key', CERT: '2b8fbc056da9cb.crt', CA: 'telmed.wellstats.com.csr'
//   PATH: '../ssl/wrtc.ru/',             KEY  : 'wrtc-ssl.key',          CERT : 'wrtc-ssl.crt',      CA: 'sub.class1.server.ca.pem'
   PATH: '../ssl/wrtc.ru/',             KEY  : '5_wrtc.ru.key',          CERT : '4_wrtc.ru.crt',      CA: '3_issuer.crt'
//  PATH: '../ssl/selfsigned/',          KEY  : 'privatekey.pem',        CERT : 'certificate.pem',   CA: 'ca.pem'
  },

//  HOSTNAME   : 'telmed.wellstats.com', HTTP_PORT: 0, HTTPS_PORT: 8080,
//  HOSTNAME   : 'wrtc.ru',              HTTP_PORT: 8080, HTTPS_PORT: 8081,
//  HOSTNAME   : '192.168.56.1',         HTTP_PORT: 8080, HTTPS_PORT: 8080,
//  HOSTNAME   : '10.0.2.2',             HTTP_PORT: 8080, HTTPS_PORT: 8080,
//  HOSTNAME   : '192.154.182.21',       HTTP_PORT: 8080, HTTPS_PORT: 8081, // EMR VC
//  HOSTNAME   : '216.195.78.24',       HTTP_PORT: 8081, HTTPS_PORT: 8081,  // CareConnect
//  HOSTNAME   : 'localhost',            HTTP_PORT: 8080, HTTPS_PORT: 8081,
  HOSTNAME   : '192.168.1.32',            HTTP_PORT: 8080, HTTPS_PORT: 8081,

  /**
   * Configuration for ICE/TURN
   **/

  TURN : {
    /** Array of servers **/
    SERVERS : [{
        protocol  : 'turn',
        //hostname  : 'telmed.wellstats.com',
        hostname  : '192.154.182.21', // EMR
        //hostname  : '216.195.78.24',    // CareConnect
        port      : '3478',
        transport : 'udp',
        username  : 'demo',
        password  : 'testing'
      }, {
        protocol  : 'turn',
        //hostname  : 'telmed.wellstats.com',
        hostname  : '192.154.182.21', // EMR
        //hostname  : '216.195.78.24',    // CareConnect
        port      : '3478',
        transport : 'tcp',
        username  : 'demo',
        password  : 'testing'
    }],
    /* For test purposes, limit types of ICE candidates which will be passed to RTCPeerConnection
     * ...when received from remote side to test ICE/TURN procedures.
     *
     * Can't use TURN_TYPE constants as all .js fields are not yet loaded.
     */
     DEBUG : {
       BLOCK: [
       /* Comment out all to allow all candidate types        */
//      'host', 'srflx', 'prflx', 'relay' // Uncomment to block all candidate types (disable all ICE completely)
//      'host', 'srflx', 'prflx'          // Uncomment to block all except TURN (to check if TURN is OK)
//              'srflx', 'prflx', 'relay' // Uncomment to block all except 'host'
//      'host',                   'relay' // Uncomment to block 'host' & 'relay' (TURN), leaving only STUN candidates
//                                'relay' // Uncomment to block 'relay' (TURN) candidates
//      'host'                            // Uncomment to block 'host' candidates
      ]
    }
  },

  EMAIL: {
    TRANSPORT: {
//      host: 'email-smtp.us-west-2.amazonaws.com', port: 587,
//      host: 'email-smtp.us-west-2.amazonaws.com', port: 465, secure: true, ignoreTLS: true,
//      auth: { user: 'AKIAIRHBDNR24UV5NZSQ', pass: 'ApBkYI40l4+RsD/YBAwZHh2YmRsnVxn4dcnf7c8zWghe'}
      host: 'email-smtp.us-west-2.amazonaws.com', port: 465, secure: true, ignoreTLS: true,
      auth: { user: 'AKIAIVEYPBEB677S5G6A', pass: 'At10OCi1fvTg8lawrLnwl+kplH5OBP2Ej4SGFRai1Lf+'}
    },
    FROM: 'connect@linktovid.com'
  },
//  EMAIL: {
//    TRANSPORT: {
//      service: 'Gmail', auth: { user: 'alykoshin@gmail.com', pass: 'yqbkqzqgenskrpgb' }
//    },
//    FROM: 'alykoshin@gmail.com'
//  },
  /**
   * Temasys plugin configuration
   **/
  TEMASYS: false /*{
    DOWNLOAD: {  // Download links for the plugin
      IE:     '/downloads/TemWebRTCPlugin.0.8.794.msi', // 'http://bit.ly/1kkS4FN',
      SAFARI: '/downloads/TemWebRTCPlugin.0.8.794.dmg', // 'http://bit.ly/1n77hco',
      HOME:   '' //'https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins'
    },
    // Debug level for Temasys IE plugin: "SENSITIVE" "VERBOSE" "INFO" "WARNING" "ERROR" "NONE"
    // https://temasys.atlassian.net/wiki/display/TWPP/How+to+use+the+plugin+in+verbose+mode
    DEBUG_LEVEL : "VERBOSE" //"WARNING" //"INFO" // "NONE" //  "VERBOSE"
  }*/
};

if (!CONFIG || !CONFIG.HOSTNAME || (
  (CONFIG.USE_SSL && !CONFIG.HTTPS_PORT) || (!CONFIG.USE_SSL && !CONFIG.HTTP_PORT)) ) {
  throw ('Invalid CONFIG parameters. Please, check app_config.js');
}

CONFIG.PROTOCOL = CONFIG.USE_SSL ? 'https'           : 'http';
CONFIG.PORT     = CONFIG.USE_SSL ? CONFIG.HTTPS_PORT : CONFIG.HTTP_PORT;
CONFIG.BASE_URL = CONFIG.PROTOCOL +'://' + CONFIG.HOSTNAME + ':' + CONFIG.PORT;

/***********************************************************************************************************************
 *  If script is running in browser, then output HTML code to load other scripts
 *
 * Can't use functions isClient() isServer() as all .js files are not yet loaded
 */
/*
if ( typeof document !== 'undefined' ) { // isClient() ) {
  document.writeln(
    '<script ' +
//      'data-main="' + CONFIG.BASE_URL + '/js/wrtcapp/index.js"\n'+
//      'src="'       + CONFIG.BASE_URL + '/js/3rdparty/common/require.js"' +
      'data-main="./js/wrtcapp/index.js"\n'+
      'src="./js/vendor/require.js"' +
    '></script>');
}
  */

if (typeof module !== 'undefined' && module && module.exports) {
  module.exports = CONFIG;
}

/**********************************************************************************************************************/
