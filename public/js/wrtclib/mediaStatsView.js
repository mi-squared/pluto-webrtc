/**
 * Created by alykoshin on 7/25/14.
 */

function doShowStats(video) {
  var statsDiv, connId, conn;

  statsDiv = document.getElementById('wrtcStats');
  elementFlipHidden(statsDiv);  /** Change visibility class **/
  statsDiv.focus();             /** Set focus to it         **/

  connId = video.getAttribute('data-conn-id');

  debug.log('doShowStats(): video:', video, '; connId:', connId);
  conn = peerConnections.find(connId);

//  if (pc.wrtcStats.onStats) {
//  pc.wrtcStats.onStats = null;
//  } else {
  if (conn) {
    conn.wrtcStats.onTextStats = function(html1, html2) {
      /*      var div1 = document.getElementById('wrtcStats1');
       div1.innerHTML = html1;
       var div2 = document.getElementById('wrtcStats2');
       div2.innerHTML = html2;*/
      statsDiv.innerHTML = html1 + html2;
      statsDiv.setAttribute('connId', connId);
    };
//  }
  }
}

function doHideStats(statsDiv) {
  var connId = statsDiv.getAttribute('data-conn-id');
  var pc = peerConnections.find(connId);
  if (pc) {
    pc.wrtcStats.onStats = null;
  }
  //var statsDiv = document.getElementById('wrtcStats');
  elementFlipHidden(statsDiv);
}

addEventById('wrtcStats', 'onkeydown', function(event) {
  var self = this;
    //var chCode = ('charCode' in ev) ? ev.charCode : ev.keyCode;
    //debug.debug('!!!!!!!!!!!', chCode);
    if (event.keyCode /*chCode*/ === 27) {
      doHideStats(self);
    }
    /** Disable to allow processing of F5 and other keys when Stats are in focus
     // event.preventDefault();
     **/
});

addEventById('wrtcStats', 'ondblclick', function (event) {
  var self = this;
  doHideStats(self);
  event.preventDefault();
});

