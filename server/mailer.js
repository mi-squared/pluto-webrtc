/**
 * Created by alykoshin on 8/12/14.
 */

/**
 * Based on http://blog.nodeknockout.com/post/34641712180/sending-email-from-node-js
 */


'use strict';

var WrtcMailer = (function() {
  "use strict";

  var CONFIG =  require('../public/common/app_config.js');

  //var toName      = '';
  //var fromAddress = 'alykoshin@gmail.com'; //'util4home@gmail.com';
  //var password    = 'yqbkqzqgenskrpgb';    //'don77lOlLY';

  var that = {};

  var nodemailer = require('nodemailer');

  var smtpTransport = nodemailer.createTransport(/*'SMTP',*/ /*{
    service: 'Gmail',
    auth: {
      user: fromAddress,
      pass: password
    }
  }*/
    CONFIG.EMAIL.TRANSPORT
  );

  /**
   *
   * @param {string} fromName
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {string} url
   */
  that.sendInvite = function(fromName, fromAddress, toAddress, url) {

    var mailOptions = {
      from:    fromName + ' ' + '<' + CONFIG.EMAIL.FROM + '>',  // sender address
      to:   /*toName   + ' ' +*/ toAddress,   // comma separated list of receivers
      subject: 'Invitation to VideoChat', // Subject line
      text:    'You have been invited to Video Chat by ' +
        fromName +
        (fromAddress ? ' <' + fromAddress+ '>' : '')
        + '. \n'  + // plaintext body
        'To access it, please, follow this link: ' + url
    };
    if (fromAddress) { mailOptions.replyTo = fromAddress; }

    console.log('mailOptions: ', mailOptions);

    smtpTransport.sendMail(mailOptions, function(error, info){
      if(error) {
        console.log(error);
      } else {
        console.log("Message sent: " + info.response);
      }
    });
  };

  return that;
});

//wrtcMailer = new WrtcMailer();
module.exports = WrtcMailer();

