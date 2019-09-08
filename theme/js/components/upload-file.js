Vue.component('upload-file', {
  template: '#upload-file-template',
  props: ['value'],
  watch: {
//    filter: {
//      handler:function (){
//        console.log('Pressed Upload')
//      }
//    },
  },
  methods: {
    uploadFile: function(){
      console.log('Pressed Upload')
      self = this
      $.ajax({
          url: 'https://vv758wqt2h.execute-api.us-east-1.amazonaws.com/dev/task_submit',
          type: 'get',
          headers: {
              "x-api-key": 'CiFDhNdkM298ntubIc3rr1zTmJjURn2e5SpDA2Zk',
              'x-filename': 'filename.zip'
          },
          success: function (data) {
              self.postFileContents(data)
          }
      });
      console.log('Sent request')
    },

    postFileContents: function(data){
        console.log('Successfully submitted! Got data: ' + JSON.stringify(data))

        var file = document.getElementById('inputGroupFile04').files[0];

        var that = this;
        var formData = new FormData();
        var fields = data['keys']['fields'];
        var url = data['keys']['url'];

        Object.keys(fields).forEach(function(key) {
            formData.append(key, fields[key]);
        });
        formData.append("file", file, file.name);

        $.ajax({
            type: "POST",
            url: url,
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    console.log('Start progress')
//                    myXhr.upload.addEventListener('progress', that.progressHandling, false);
                }
                return myXhr;
            },
            headers: {

            },
            success: function (data) {
                console.log('Upload success!! ' + + JSON.stringify(data) )
            },
            error: function (error) {
                console.log('Upload failure!! ' + JSON.stringify(error))
            },
            async: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000
        });
    }
  }
});
//
//var Upload = function (file) {
//    this.file = file;
//};
//
//Upload.prototype.getType = function() {
//    return this.file.type;
//};
//Upload.prototype.getSize = function() {
//    return this.file.size;
//};
//Upload.prototype.getName = function() {
//    return this.file.name;
//};
//Upload.prototype.doUpload = function () {
//
//};
//
//Upload.prototype.progressHandling = function (event) {
//    var percent = 0;
//    var position = event.loaded || event.position;
//    var total = event.total;
//    var progress_bar_id = "#progress-wrp";
//    if (event.lengthComputable) {
//        percent = Math.ceil(position / total * 100);
//    }
//    // update progressbars classes so it fits your code
//    $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
//    $(progress_bar_id + " .status").text(percent + "%");
//};