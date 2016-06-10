/**
 * Created by alykoshin on 7/1/14.
 *
 * Based on
 * https://code.google.com/p/webrtc/source/browse/stable/samples/js/demos/html/constraints-and-stats.html
 *
 * Another article:
 * http://muaz-khan.blogspot.ru/2014/05/webrtc-tips-tricks.html
 *
 * WebRTC capabilities detection example
 * https://github.com/muaz-khan/WebRTC-Experiment/blob/master/DetectRTC/DetectRTC.js
 *
 * Suggestion on quality metric:
 * -----------------------------
 * - For jitter, we already have an entry in the stats report
 * - I'll suggest to the working group that we should add packet loss to the evolving list of stats
 * - As far as I know, there's no good way to get RTT information out of RTP and RTCP,
 *   so you'll probably want to rig something up with a DataChannel that basically sends
 *   a small message with a sequence number to the other side, which responds immediately;
 *   the time between sending the message and getting the response is you RTT
 *
 * (min(6ms - jitter_in_ms, 0) * (100% - packet_loss_in_percent) * min(200ms - rtt_in_ms, 0))/600
 * ...which should get you a number between 1 and 100. You might want to
 * tweak things a bit, but that should get you a good first pass estimate.
 * https://groups.google.com/d/msg/mozilla.dev.media/ZLAVAeKnJ-U/Igl6X7gLjgsJ
 *
 * ================================================================================
 * Вывод статистики в Firefox:
 * pcs['YmpJGOzUQ8qOOJZaeg_Q'].getStats(null, function(obj){tmp1 = obj;}, function(obj){tmp2 = obj;})
 * tmp1.forEach(function(v,i,a){console.log(i,v)} )
 *
 * --------------------------------------------------------------------------------
 * Вывод статистики в Chrome:
 * pcs['kvd_JGZs7H6bim-Jeg_U'].getStats(function(obj) { tmp1 = obj; } )
 * results = tmp1.result(); for(var i=0; i<results.length; ++i) { res = results[i]; console.log('res:', res); if(results[i].names) { names = results[i].names(); console.log('names:',names); for (j in names) {console.log('>>>', j , names[j], ':', results[i].stat(names[j]))} } }
 *
 * ================================================================================
 */

'use strict';

var WrtcStats = function(connection) {
  var pc = connection.rtcPeerConnection;
  var self = _rtcStats(pc);

//  var history = {};

  self.onTextStats = null; // Callback on Stats update
  self.onThreshold = null; // Threshold exceeded

  function display(s1, s2) {
    // debug.log(s1, s2);
    if (self.onTextStats) {
      self.onTextStats(s1, s2);
    }
  }

  function dumpObject(reportObject, namesToOutput, nameToMark, options) {
    var name, value, res = '',
      delimiter = (options && options.delimiter) || '<br>',
      separator = (options && options.separator) || ': ';
    //if (namesToOutput.length > 0) { // namesToOutput array not empty; output only indicated name-value pairs
    //  for (i=0; i<namesToOutput.length; i++) {
    //    name = namesToOutput[i];
    //    value = reportObject[name];
    //    if (value !== undefined) {
    //      console.log('name:', name, ';nameToMark[name]', nameToMark[name]);
    //      if (nameToMark.indexOf(name) > -1) {
    //        value = '<b>'+value+'</b>';
    //      }
    //      res += name + separator + value + delimiter;
    //    }
    //  }
    //} else {
      for (name in reportObject) {
        if (reportObject.hasOwnProperty(name) && namesToOutput.indexOf(name) > -1 ) {
          value = reportObject[name];
          //console.log('name:', name, ';nameToMark[name]', nameToMark[name]);
          if (nameToMark.indexOf(name) > -1) {
            value = '<b>'+value+'</b>';
          }
          res += name + separator + value + delimiter;
        }
      //}
    }
    return res;
  }

  function getStatsSuccess(stats) {

    function overThreshold(reportObject, name, op, thold) {
      var res,
        value = reportObject[name];
      if (value === undefined) {
        res = false;
      } else {
        res =
          (  (op === '>'   && value >   thold)
          || (op === '>='  && value >=  thold)
          || (op === '=='  && value ==  thold)
          || (op === '===' && value === thold)
          || (op === '!='  && value !=  thold)
          || (op === '!==' && value !== thold)
          || (op === '<'   && value <   thold)
          || (op === '<='  && value <=  thold)
          );
      }
      //if (name === 'wrtcPacketLostPercent') {
      //  console.warn('Threshold exceeded: '+name+'='+reportObject[ THRESHOLDS[j].name ].value+' ('+THRESHOLDS[j].op+' '+THRESHOLDS[j].thld+')');
      //}
      return res;
    }

    var THRESHOLDS = [
      { name: 'wrtcPacketLostPercent', op: '>',    thld: 5 },
      { name: 'wrtcBitRateReceive',    op: '===',  thld: 0 },
      // Firefox specific
      { name: 'mozRtt',                op: '>',    thld: 200 },
      { name: 'jitter',                op: '>',    thld: 0.2 },
      // Chrome (also IE+Temasys) specific
      { name: 'googCurrentDelayMs',    op: '>',    thld: 400 }, // was: 200
      { name: 'googRtt',               op: '>',    thld: 200 },
      { name: 'googJitterReceived',    op: '>',    thld: 200 }
    ];

    var statsString = '';
    var reports = stats.reports;
    var flowInfo = '';
    var i, j, reportObject, thlds = [];
    var CHROME_PARAMS = [
//      'type',
      'googCodecName',      'packetsLost',        'googRtt',              'googJitterReceived',
      'googTargetDelayMs',  'googDecodeMs',       'googRenderDelayMs',    'googMaxDecodeMs',
      'googJitterBufferMs', 'googCurrentDelayMs', 'googMinPlayoutDelayMs',
      'wrtcType', 'wrtcMedia', 'wrtcDirection',
      'wrtcBitRateReceive', 'wrtcBitRateSend', 'wrtcPacketRateReceive', 'wrtcPacketRateSend',
      'wrtcPacketLostRate', 'wrtcPacketLostPercent'
    ];
    var MOZ_PARAMS = [
//      'type',
      'jitter', 'mozRtt', 'packetsLost',
      'wrtcType', 'wrtcMedia', 'wrtcDirection',
      'wrtcBitRateReceive', 'wrtcBitRateSend', 'wrtcPacketRateReceive', 'wrtcPacketRateSend',
      'wrtcPacketLostRate', 'wrtcPacketLostPercent'
    ];
    var PARAMS_BOLD = [
      'type', 'wrtcMedia', 'wrtcDirection'
    ];
    var PARAMS = (webrtcDetectedBrowser === "firefox") ? MOZ_PARAMS : CHROME_PARAMS;
    // Iterate through stat reports
    for (i = 0; i < reports.length; i++) {
      reportObject = reports[i];
      statsString += '<h3>Report ' + i + '</h3>';
      statsString += dumpObject(reportObject, [], PARAMS_BOLD, {delimiter:'<br>'});

      flowInfo += '<tr>';
      flowInfo += '<td>Report_' + i  + '</td>';
      flowInfo += '<td>' + dumpObject(reportObject, PARAMS, PARAMS_BOLD, {delimiter:'; '}) + '</td>';
      flowInfo += '</tr>';
      statsString += '<br>';


      if (reportObject.wrtcType==='media') {
        for (j=0; j< THRESHOLDS.length; j++) {
          if (overThreshold(reportObject, THRESHOLDS[j].name, THRESHOLDS[j].op, THRESHOLDS[j].thld) ) {
            console.warn('Threshold exceeded: '+THRESHOLDS[j].name+'='+reportObject[ THRESHOLDS[j].name ]+' ('+THRESHOLDS[j].op+' '+THRESHOLDS[j].thld+')');
            thlds.push( { obj: reportObject, thld: THRESHOLDS[i] } );

          }
        }
      }
    }

    //if (thlds.length>0) {
      if (self.onThreshold) { self.onThreshold( thlds ); }
    //}

    flowInfo = '<table>' + flowInfo + '</table> <br>';



    display( flowInfo, statsString);
  }

  /** Periodically retrieve statistics **/

  self.on('_getStatsSuccess', getStatsSuccess);
  self._start();

  self.stop = self._stop;

  return self;
};
