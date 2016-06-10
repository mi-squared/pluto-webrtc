/**
 * Created by alykoshin on 9/19/14.
 */

clipboardInit = function (mainElementId, fallbackElementId) {
  var SWF_PATH = './vendor/swf/ZeroClipboard.swf';

  ZeroClipboard.config( { swfPath: SWF_PATH } );

  var zeroClient = new ZeroClipboard(document.getElementById(mainElementId));
  var zeroError = false;

  zeroClient.on( "copy", function (event) {
    var clipboard = event.clipboardData;
//  clipboard.setData( "text/plain", "Copy me!" );
//  clipboard.setData( "text/html", "<b>Copy me!</b>" );
//  clipboard.setData( "application/rtf", "{\\rtf1\\ansi\n{\\b Copy me!}}" );
//    console.log('>>>', clipboard);
  });

  zeroClient.on( 'aftercopy', function(event) {
    window_alert('Conference link copied!'); //'Copied text to clipboard: \n' + event.data['text/plain']);
  });

  zeroClient.on( 'error', function(event) {
    debug.warn( 'ZeroClipboard error of type "' + event.name + '": ' + event.message );
    zeroError = true;
    //ZeroClipboard.destroy();
  } );

  // Make text selected
  addEventById(fallbackElementId, 'click', function(event) {
    /** For all browsers except Safari **/
    //this.select();
    /** For Safari **/
    this.setSelectionRange(0, this.value.length);
    event.preventDefault(); event.stopPropagation();
  });

  //
  addEventById(mainElementId, 'click', function(event) {
    // copyToClipboard( document.getElementById('link').value);
    //event.preventDefault(); event.stopPropagation();
    //console.log('clicked');
    if (zeroError) {
      window.prompt ("Auto copy to clipboard is not available.\nTo copy to clipboard please press \'Ctrl+C\', then \'Enter\'", document.getElementById(fallbackElementId).value);
    }
  });

};
