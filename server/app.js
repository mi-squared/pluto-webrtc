'use strict';

//require('./public/webrtc/mylib/utils.js');
//require('../common/app_config.js');
var CONFIG = require('../public/common/app_config.js');


var express = require('express');
var app       = express();

function openHTTP(app) {
  var http      = require('http');
  var httpServer  = http.createServer(app);
  //, ioHTTP      = io.listen(httpServer);     // socket.io over HTTP
  //var socket    = io.listen(httpServer);     // socket.io over HTTP
  // Открываем порт
  httpServer.listen(CONFIG.HTTP_PORT); // веб-сервер
  console.log('httpServer.listen('+CONFIG.HTTP_PORT+')');

  //return socket;
  return httpServer;
}

function openHTTPS(app) {
  // HTTPS Certificates
  var fs   = require('fs');
  var crypto = require('crypto');
  var options = {
    key:  fs.readFileSync(CONFIG.CERTIFICATE.PATH + CONFIG.CERTIFICATE.KEY),
    cert: fs.readFileSync(CONFIG.CERTIFICATE.PATH + CONFIG.CERTIFICATE.CERT),
    ca:   fs.readFileSync(CONFIG.CERTIFICATE.PATH + CONFIG.CERTIFICATE.CA),
    requestCert:        false, // true, // When true, Firefox requests: 'This site has requested that you identify yourself with a certificate
    rejectUnauthorized: false
  };

  var https       = require('https');
  var httpsServer = https.createServer(options, app) ;
  //, ioHTTPS     = io.listen(httpsServer);    // socket.io over HTTPS
  //var ioSocket    = io.listen(httpsServer);    // socket.io over HTTPS
  // Открываем порт
  httpsServer.listen(CONFIG.HTTPS_PORT);
  console.log('httpsServer.listen('+CONFIG.HTTPS_PORT+')');

  //return ioSocket;
  return httpsServer;
}


// Serve static pages
var ROOT_DIR = __dirname+'/..';


var https_redirect = function(req, res, next) {
  var link;

  console.log(req.headers);

  // localhost:8080
  var myRegexp = /(.+):(\d{1,5})/g;

  var match = myRegexp.exec(req.headers.host);
  var host = match[1],
    port = match[2];
  if (!port) { port = req.secure ? '443' : '80' } // Default values

  console.log('host: \''+host+'\'; port: \''+port+'\'');
  link = 'https://' + host + ':' + CONFIG.HTTPS_PORT + req.url;

  if (req.secure) {
    console.log('req.secure');

    console.log('port:\''+port+'\'; CONFIG.HTTPS_PORT:\''+CONFIG.HTTPS_PORT+'\'');

    console.log('typeof port:\'', typeof port, '\'; typeof  CONFIG.HTTPS_PORT:\'', typeof CONFIG.HTTPS_PORT, '\'');
    console.log('port === CONFIG.HTTPS_PORT:', (port === CONFIG.HTTPS_PORT) );
    if ( port === ''+ CONFIG.HTTPS_PORT ) {
      console.log('req.secure: no redirect');
      return next();
    } else {
      console.log('req.secure: redirect: '+link);
      return res.redirect(link);
    }
  } else {
    console.log('else: '+link);
    return res.redirect(link);
  }
};

if (CONFIG.USE_SSL && CONFIG.HTTP_PORT  && (CONFIG.HTTP_PORT !== 0) ) {
  openHTTP(app);
  app.use(https_redirect);
}

// Parse Request and Response parameters
app.use(express.urlencoded());
app.use(express.json());


app.use('/', express.static(ROOT_DIR + '/' + 'public'));


// All other pages return 404
app.get('*', function(req, res) {
  res.send('Page Not Found', 404);
});


var wrtcSignalling = require('./signalling')( CONFIG.USE_SSL ? openHTTPS(app) : openHTTP(app) );

