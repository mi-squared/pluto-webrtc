/**
 How to control bandwidth in WebRTC video call?
 http://stackoverflow.com/questions/16712224/how-to-control-bandwidth-in-webrtc-video-call
 */


/**
 * https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Pluginfree-Screen-Sharing/conference.js
 * https://www.webrtc-experiment.com/docs/RTP-usage.html
 * http://stackoverflow.com/questions/16712224/how-to-control-bandwidth-in-webrtc-video-call
 */

function setBandwidth(sdp, audiobw, videobw) {
  if (navigator.mozGetUserMedia) { return sdp; }
  if (navigator.userAgent.toLowerCase().indexOf('android') > -1) { return sdp; }

  // removing existing bandwidth lines
  sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

  // "300kbit/s" for screen sharing
  sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audiobw + '\r\n');
  sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videobw + '\r\n');

  return sdp;
}

function sdp_sendonly2sednrecv(sdp) {
  // = desc;
  console.log('sdp_sendonly2sednrecv');
  var lines = sdp.split('\r\n');
  for (var i=0; i<lines.length; i++) {
    if (lines[i].search('a=sendonly') !== -1) {
      var tmp = lines[i];
      lines[i] = lines[i].replace('a=sendonly', 'a=sendrecv');
      console.log('>>>>>>>>>>>>>>>>> was:', tmp, '; now:', lines[i]);
    }


//    if (lines[i].search('a=ssrc') !== -1) {
//      lines[i] = lines[i].replace('a=ssrc', 'a=xssrc');
//    }
//    if (lines[i].search('a=msid-semantic') !== -1) {
//      lines[i] = lines[i].replace('a=msid-semantic', 'a=xmsid-semantic');
//    }


  }
  var newSdp = lines.join('\r\n')
  return newSdp;
}

function sdp_recvonly2sednrecv(sdp) {
  console.log('sdp_recvonly2sednrecv');
  var lines = sdp.split('\r\n');
  for (var i=0; i<lines.length; i++) {
    if (lines[i].search('a=recvonly') !== -1) {
      var tmp = lines[i];
      lines[i] = lines[i].replace('a=recvonly', 'a=sendrecv');
      console.log('>>>>>>>>>>>>>>>>> was:', tmp, '; now:', lines[i]);
    }
  }
  var newSdp = lines.join('\r\n');
  return newSdp;
}


/**
 * SDP manipulating routines from apprtc.appspot.com
 *
 * Set |codec| as the default audio codec if it's present.
 * The format of |codec| is 'NAME/RATE', e.g. 'opus/48000'.
 *
 * Codecs set by default in Ubuntu 13.10
 * Chromium 32.0.1700.107 & Chrome  33.0.1750.117:
 *   opus/48000/2 ISAC/16000 ISAC/32000 PCMU/8000 PCMA/8000
 * Firefox 28.0 (beta):
 *   opus/48000/2 PCMU/8000 PCMA/8000
 *
 * a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
 * http://tools.ietf.org/html/rfc6464
 * If the vad extension attribute is not specified, the
 * default is "vad=on"
 */

function preferAudioCodec(sdp, codec) {
  if (!codec) {
    console.log('No preference on audio send codec.');
    return sdp;
  }

  console.info('preferAudioCodec():', codec);

  var fields = codec.split('/');
  if (fields.length != 2) {
    console.log('Invalid codec setting: ' + codec);
    return sdp;
  }
  var name = fields[0];
  var rate = fields[1];
  var sdpLines = sdp.split('\r\n');

  /** Search for first 'm=audio' line **/
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('m=audio') !== -1) {
      var mLineIndex = i;
      break;
    }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  /** If the codec is available, set it as the default in m line. **/
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search(name + '/' + rate) !== -1) {
      var regexp = new RegExp(':(\\d+) ' + name + '\\/' + rate, 'i');
      var payload = extractSdp(sdpLines[i], regexp);
      if (payload) {
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], payload);
      }
      break;
    }
  }

  /** Remove CN in m line and sdp. **/
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

/** Set Opus in stereo if stereo is enabled. **/
function addStereo(sdp) {
  var sdpLines = sdp.split('\r\n');

  // Find opus payload.
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      break;
    }
  }

  // Find the payload in fmtp line.
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('a=fmtp') !== -1) {
      var payload = extractSdp(sdpLines[i], /a=fmtp:(\d+)/ );
      if (payload === opusPayload) {
        var fmtpLineIndex = i;
        break;
      }
    }
  }
  /** No fmtp line found. **/
  if (fmtpLineIndex === null) {
    return sdp;
  }
  /** Append stereo=1 to fmtp line. **/
  sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat(' stereo=1');

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return (result && result.length == 2) ? result[1]: null;
}

/** Set the selected codec to the first in m line. **/
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = new Array();
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) {            /** Format of media starts from the fourth. **/
      newLine[index++] = payload; /** Put target payload to the first.        **/
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

/** Strip CN from sdp before CN constraints is ready. **/
function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  /** Scan from end for the convenience of removing an item. **/
  for (var i = sdpLines.length-1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        /** Remove CN payload from m line. **/
        mLineElements.splice(cnPos, 1);
      }
      /** Remove CN line in sdp **/
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}
