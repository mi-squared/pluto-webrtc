(function loader() {
  'use strict';

  if (typeof window !== 'undefined' && (typeof window.wrtc === 'undefined' || window.wrtc === null)) {
    window.wrtc = {};
  }

  if ( typeof document !== 'undefined' ) {
    //var index_js   = './js/apps/notifier/index.js';
    //var el = document.getElementById('wrtc-loader');

    var els = document.getElementsByClassName('wrtc-loader');
    if (els.length === 0) {
      throw 'Scripts with class="wrtc-loader" not found, unable to continue.';
    }

    for (var len=els.length, i=0; i<len; ++i) {

      var el = els[i];
      var index_js = el.getAttribute('data-main');
      if (!el || !index_js) {
        throw 'Script with class="wrtc-loader" has no attr="data-main".';
      }

      var require_js = './vendor/js/require.js';

      document.writeln(
        '<script ' +
        'data-main="' + index_js + '"\n' +
        'src="' + require_js + '"' +
        '></script>'
      );
    }

  }

})();
