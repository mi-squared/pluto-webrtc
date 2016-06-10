'use strict';

function initDialogUserListInvite (listSelector, templateId) {

  var coverSelector = '.dialog-cover';

  initUserListStatus(listSelector, templateId);

  $(coverSelector).click(function(/*e*/) {
    $(coverSelector).hide();
  });

  $( document ).keydown(function(e) {
    if ( e.keyCode === 27 && $(coverSelector).is(":visible") ) { // ESC
      $(coverSelector).hide();
    }
  });




}
