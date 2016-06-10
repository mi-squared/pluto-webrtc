/**
 * Created by alykoshin on 7/22/14.
 */

'use strict';

/**
 *
 * @param {MediaStream} stream
 * @returns {MediaStreamView}
 *
 * @constructor
 * @extends MediaStreamController
 */

var MediaStreamView = function(stream) {

  /** @lends MediaStreamView **/
  var that = new MediaStreamController(stream);

  that = Attachable(that);

  /** Public methods - Stream control **/

  var super_stop = that.stop;
  that.stop = function () {
    super_stop();
    that.detachAll();
  };

  return that;
};
