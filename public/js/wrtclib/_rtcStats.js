/**
 * Created by alykoshin on 11/7/14.
 */

'use strict';

var _rtcStats = function(rtcPeerConnection) {

  var STATS_UPDATE_PERIOD = 2000, // Milliseconds
    DEFAULT_RATE = -1;

  /**
   * Calculate rate for one counter
   *
   * @param {integer} counter1      // Previous counter value
   * @param {integer} counter2      // New counter value
   * @param {timestamp} timestamp1  // Previous timestamp
   * @param {timestamp} timestamp2  // Current timestamp
   * @returns {float}
   * @private
   */
  function calcRatePerSecond(counter1, counter2, timestamp1, timestamp2) {
    var rate,
      counterDiff, timeStampDiff,
      period = 1000; // rate period is 1000 milliseconds (1 second)
    try {
      counterDiff   = counter2 - counter1;
      timeStampDiff = timestamp2 - timestamp1;
      rate = Math.round( period * counterDiff / timeStampDiff );
    } catch (e) {
      rate = DEFAULT_RATE;
    }
    if (isNaN(rate)) { rate = DEFAULT_RATE; }
    return rate;
  }

  // Get and store historical data and calculate rates
  //
  function internalCalcRate(reportName, paramName, timeNew, counterNew) {
    var rate = DEFAULT_RATE;
    var updated  = false;
    var index = reportName + '.' + paramName,
      idxTime_1s    = index + '.' + 'Time'    + '_' + '1s',
      idxCounter_1s = index + '.' + 'Counter' + '_' + '1s',
      idxRate_1s    = index + '.' + 'Rate'    + '_' + '1s',
      idxTime_5s    = index + '.' + 'Time'    + '_' + '5s',
      idxCounter_5s = index + '.' + 'Counter' + '_' + '5s',
      idxRate_5s    = index + '.' + 'Rate'    + '_' + '5s';

    if (history[idxTime_1s] !== timeNew ) { // Time is different from previous value
      if (history[idxTime_1s] > 0) {        // And previous timestamp already was set before
        if (counterNew !== undefined) {                   // If new value presented
          rate = calcRatePerSecond(history[idxCounter_1s], counterNew, history[idxTime_1s], timeNew);
          updated = true;
        }
      }
      history[idxCounter_1s] = counterNew;  // Store current values
      history[idxTime_1s]    = timeNew;     //
      history[idxRate_1s]    = rate;        //
    } else {
      //rate     = history[idxRate_1s];       // Return old value if no new data
      updated  = false;                     // and indicate that there was no update
    }
    //return { rate: rate, updated: updated };
    return rate;
  }

  function calcAndSetRate(report, rateName, counterName, mult) {
    if (report !== undefined && report[counterName] !== undefined) {
      mult = mult || 1;
      report[rateName] = internalCalcRate(report.id, counterName, report.timestamp, report[counterName]) * mult;
    }
  }

  var preprocess = function(rawStats) {

    function webkitCopyProps (srcReport) {
      var i, report = {};
      if (srcReport.id !== undefined) {
        report.id = srcReport.id;
      }
      if (srcReport.type !== undefined) {
        report.type = srcReport.type;
      }
      if (srcReport.timestamp !== undefined) {
        report.timestamp = srcReport.timestamp;
      }
      names = srcReport.names();
      for (i = 0; i < names.length; i++) {
        report[names[i]] = srcReport.stat(names[i]);
      }
      return report;
    }

    function mozCopyProps (srcReport) {
      var i, report = {};
      for (i in srcReport) {
        if (srcReport.hasOwnProperty(i)) {
          report[i] = srcReport[i];
        }
      }
    }

    function calcRates(report) {
      calcAndSetRate(report, 'wrtcBitRateReceive', 'bytesReceived', 8);
      //if (report.bytesReceived !== undefined) {
      //  report.wrtcBitRateReceive = internalCalcRate(report.id, 'bytesReceived', report.timestamp, report.bytesReceived) * 8;
      //}
      calcAndSetRate(report, 'wrtcBitRateSend', 'bytesSent', 8);
      //if (report.bytesSent !== undefined) {
      //  report.wrtcBitRateSend = internalCalcRate(report.id, 'bytesSent', report.timestamp, report.bytesSent) * 8;
      //}
      calcAndSetRate(report, 'wrtcPacketRateReceive', 'packetsReceived');
      //if (report.packetsReceived !== undefined) {
      //  report.wrtcPacketRateReceive = internalCalcRate(report.id, 'packetsReceived', report.timestamp, report.packetsReceived);
      //}
      calcAndSetRate(report, 'wrtcPacketRateSend', 'packetsSent');
      //if (report.packetsSent !== undefined) {
      //  report.wrtcPacketRateSend = internalCalcRate(report.id, 'packetsSent', report.timestamp, report.packetsSent);
      //}
      calcAndSetRate(report, 'wrtcPacketLostRate', 'packetsLost');

      //if (report.packetsLost !== undefined) {
      if ( report !== undefined && report.wrtcPacketLostRate !== undefined ) {
        // Packet loss rate (counter change for the period) per second
        //report.wrtcPacketLostRate = internalCalcRate(report.id, 'packetsLost', report.timestamp, report.packetsLost);

        if (report.wrtcPacketRateReceive !== undefined) {
          if (report.wrtcPacketRateReceive > 0) { // 0 if nothing received, -1 for first statistic measure
            // Packet loss percentage for the period
            report.wrtcPacketLostPercent = 100 * report.wrtcPacketLostRate / report.wrtcPacketRateReceive;
          } else {
            report.wrtcPacketLostPercent = 0; // unknown as we don't know whether the remote end send packet to us
          }
        } else if (report.wrtcPacketRateSend !== undefined) {
          if (report.wrtcPacketRateSend > 0) { // 0 if nothing received, -1 for first statistic measure
            // Packet loss percentage for the period
            report.wrtcPacketLostPercent = 100 * report.wrtcPacketLostRate / report.wrtcPacketRateSend;
          } else {
            report.wrtcPacketLostPercent = 0; // unknown as we don't know whether the remote end send packet to us
          }
        }
      }
    }
    var self = {};
    var i, j, names;
    var send, recv;

    var srcReports = rawStats.result ? rawStats.result() : rawStats;

    var srcReport,
      report;

    self._rawStats = rawStats;

// Not efficient, but simple and fast to code
    self.reports = [];

    for (i in srcReports) {
      if (srcReports.hasOwnProperty(i)) {
        srcReport = srcReports[i];
        report = {};

// We are not trying to support every version of Chrome
//
//      if (!singleReport.local || singleReport.local === singleReport) {
//        ...
//      } else {
//        /** Pre-227.0.1445 (188719) browser **/
//        if (singleReport.local) {
//          statsString += "<p>Local ";
//          statsString += chromeDumpStats(singleReport.local);
//        }
//        if (singleReport.remote) {
//          statsString += "<p>Remote ";
//          statsString += chromeDumpStats(singleReport.remote);
//        }
//      }

        if (srcReport.names) { // Seems to be Chrome or something like that (IE+Temasys)
          report = webkitCopyProps(srcReport);
          // Direction: Send/Receive/Both
          send = ( (report.bytesSent    !== undefined) || (report.packetsSent     !== undefined) );
          recv = ( (report.bytesReceived!== undefined) || (report.packetsReceived !== undefined) );
          if      (send && recv) { report.wrtcDirection = 'sendrecv'; }
          else if (send        ) { report.wrtcDirection = 'send'; }
          else if (        recv) { report.wrtcDirection = 'recv'; }

          // Media Stream
          if (report.type === 'ssrc') {
            report.wrtcType = 'media';

            // Audio or video
            if (report.audioInputLevel || report.audioOutputLevel) {
              report.wrtcMedia = 'audio';
            } else if (report.googFrameRateReceived || report.googFrameRateSent) {
              report.wrtcMedia = 'video';
            }
          }

        } else { // Seems to be Firefox
          report = mozCopyProps(srcReport);
        }

        calcRates(report);

        // New report object is ready. Store it in array
        self.reports.push(report);
      }
    }

    return self;
  };

  var self = {};
  var history = {};

  var pc = rtcPeerConnection;
  var statInterval = null;

  Emitter(self);

  self._getStatsSuccess = function(rawStats) {

    var stats = preprocess(rawStats);

    //debug.log('_rtcStats._getStatsSuccess', stats);
    self.emit('_getStatsSuccess', stats);


    // !!!!!!!!!
    window.rtcStats = stats;

//    rawStats.getParameter(report)
  };

  self._getStatsError = function(error) {
    debug.error('_rtcStats._getStatsError(): ', error);
    self.emit('_getStatsError', error);
  };

  self._getStats = function() {
    if (pc && pc.getRemoteStreams()[0]) {          // If RTCPeerConnection exists and have at least one remote stream
      if (pc.getStats) {                           // If getStats function supported
        if (webrtcDetectedBrowser === "firefox") { // If Firefox
          pc.getStats(null, self._getStatsSuccess,self. _getStatsError);

        } else if ( get_temasys_version() ) {      // If Temasys plugin (IE/Safari)
          pc.getStats(self._getStatsSuccess);        // As of 14.07.2014 Temasys took only 1 parameter

        } else {                                   // nor Firefox, nor Temasys - suppose Chrome
          pc.getStats(self._getStatsSuccess, self._getStatsError, {});

        }
      } else {                                     // getStats() not supported
        debug.warn('PeerConnection has no getStats() function. Use at least Chrome 24.0.1285');
      }
    } else {
      debug.warn('PeerConnection is null or not yet connected');
    }
  };

  self._start = function( _period ) {
    var period = _period || STATS_UPDATE_PERIOD;

    if (statInterval) { self._stop(); }

    statInterval = setInterval(function() {
      self._getStats();
    }, period);
  };

  self._stop = function() {
    clearInterval(statInterval);
    statInterval = null;
  };

  return self;

};
