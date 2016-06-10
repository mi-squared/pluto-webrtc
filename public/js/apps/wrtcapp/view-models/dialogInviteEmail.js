function initOtherUserDialog () {

  var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    name = $( '#name' ),
    email = $( '#email' ),
    allFields = $( [] ).add( name ).add( email ),
    tips = $( '.validateTips' );

  function updateTips( text ) {
    tips
      .text( text )
      .addClass( 'ui-state-highlight' );
    setTimeout(function() {
      tips.removeClass( 'ui-state-highlight', 1500 );
    }, 500 );
  }

  function checkLength( $element, fieldDecription, min, max ) {
    if ( $element.val().length > max || $element.val().length < min ) {
      $element.addClass( 'ui-state-error' );
      updateTips( 'Length of ' + fieldDecription + ' must be between ' +
        min + ' and ' + max + '.' );
      return false;
    } else {
      return true;
    }
  }

  function checkRegexp( $element, regexp, errorMessage ) {
    if ( !( regexp.test( $element.val() ) ) ) {
      $element.addClass( 'ui-state-error' );
      updateTips( errorMessage );
      return false;
    } else {
      return true;
    }
  }

  function addUserAction() {
    var valid = true;
    allFields.removeClass( 'ui-state-error' );

    valid = valid && checkLength( name,  'username', 0, 80 );
    valid = valid && checkLength( email, 'email',    6, 80 );

    //valid = valid && checkRegexp( name, /^[a-z]([0-9a-z_\s])+$/i, 'Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter.' );
    valid = valid && checkRegexp( email, emailRegex, 'eg. test@test.com' );

    if ( valid ) {
      $('#opName').val( name.val() );
      var fromName = $('#wrtcNameInput').val();

      doStartEmail(fromName, '', email.val());

      dialog.dialog( 'close' );
    }
    return valid;

  }

  var dialog = $('#dialog-invite-other').dialog({
    autoOpen: false,
    //height:   180,
    //width:    300,
    modal:    true,
    buttons:  {
      'Add user': function () {
        addUserAction();
      },
      Cancel: function () {
        dialog.dialog('close');
      }
    },
    close:    function () {
      form[0].reset();
      //allFields.removeClass( 'ui-state-error' );
    }
  });

  var form = dialog.find('form').on('submit', function (event) {
    event.preventDefault();
    addUserAction();
  });


  return dialog;
}
