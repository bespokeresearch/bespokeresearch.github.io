String.prototype.norm_to_ascii=function(){return unescape(encodeURIComponent(this))};
String.prototype.norm_to_unicode=function(){return decodeURIComponent(escape(this))};
String.prototype.crtsym=function(k){return String.fromCharCode.apply(undefined,this.split("").map(function(c){return c.charCodeAt(0)^(k||13)}))};
String.prototype.bc_encode=function(){return btoa(this.norm_to_ascii().crtsym());}
String.prototype.bc_decode=function(){return atob(this).norm_to_unicode().crtsym();}


(function() {
  'use strict';
  window.addEventListener('load', function() {
    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          console.log('Submitting!')
          $('#submit-button').attr('disabled', true);
          $("#msg_email").attr('disabled', true);
          $("#msg_text").attr('disabled', true);
          $('#submit-button').html('<i class="fa fa-spinner fa-spin"></i>  Sending...');
          grecaptcha.execute();
          event.preventDefault();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

function closeForm(){
  $('#formCollapse').collapse('hide');
  $('#messageSentCollapse').collapse('show');
  return false;
}

function sendMessage(response){
  $.ajax({
      url: 'https://ehqxv1dq36.execute-api.us-east-1.amazonaws.com/dev/ysg_msg',
      type: 'post',
      data:  JSON.stringify({
        'g-recaptcha-response': response,
        'email': $("#msg_email").val(),
        'message': $("#msg_text").val()
      }),
      headers: {
          "x-api-key": 'lLHoxAMBvw3rOLVNcXWHy7dY4JMlrdpu2DtDjEFf'
      },
      dataType: 'json',
      success: function (data) {
          closeForm();
      }
  });
}
