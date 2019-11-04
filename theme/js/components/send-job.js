/*
-- Submission disabled: (removed url and key for now)
*/

Vue.component('send-job', {
  template: '#send-job-template',
  data: function () {
      return {
        filename: 'Choose file (up to 10mb)',

        formDataEmail: '',
        formDataPrice: '',
        formDataMessage: '',

        submitFormDataElementsClassDisplay: '',
        submitButtonClassDisplay: '',

        uploadProgressBarClassDisplay: 'd-none',
        uploadProgressBarStyle: {
            'width': '0%',
            'display': 'none'
        },
        uploadSuccessClassDisplay: 'd-none',
        uploadProgressAlertText: 'Uploading the file',
        uploadProgressAlertClass: 'd-none',

        taskSubmitProgressAlertText: 'Sending task',
        taskSubmitProgressSpinnerClass: '',
        taskSubmitProgressAlertClass: 'd-none'
      };
  },
  methods: {
    getCount: function(){
        console.log('Count is:' + this.count);
        return this.count;
    },
    uploadSetFileName: function(e){
        this.filename = e.target.files[0].name
    },

    sendJob: function(){
      console.log('Pressed Send Job')
      this.uploadFileMain();
    },

    uiSubmitStart: function(){
        this.submitButtonClassDisplay = 'd-none';
        this.submitFormDataElementsClassDisplay = 'd-none';
        this.taskSubmitProgressAlertClass = 'alert-primary'
    },

    uiSubmitSuccess: function(){
        this.taskSubmitProgressAlertClass = 'alert-success'
        this.taskSubmitProgressAlertText = 'Task submitted sucessfully'
        this.taskSubmitProgressSpinnerClass = 'd-none'
    },

    uiUploadStart: function(){
        this.uploadProgressBarClassDisplay = 'alert-primary';
        this.uploadProgressAlertClass = 'alert-primary';
    },
    uiUploadProgress: function(percent){
        this.uploadProgressBarStyle['width'] = percent + '%';
        this.uploadProgressAlertText = 'Uploading the file. ' + percent + '% completed.'
    },
    uiUploadSuccess: function(){
        this.uploadProgressBarClassDisplay = 'd-none';
        this.uploadSuccessClassDisplay = 'd-none';
        this.uploadProgressAlertClass = 'alert-success'
        this.uploadProgressAlertText = 'File successfully uploaded'
    },

    uploadFile: function(){
        var self = this;
        this.uiSubmitStart();

        if(this.$refs.jobFile.files.length > 0){
            this.uiUploadStart();

            function start(i){
              if(i < 10){
                setTimeout(function(){
                  i++;
                  self.uiUploadProgress(i * 10);
                  start(i);
                }, 150);
              } else {
                self.uiUploadSuccess();
              }
            }
            start(0);

        }
        setTimeout(function () {
            self.uiSubmitSuccess();
        }, 1000);
    },

    uploadFileMain: function(){
        this.uiSubmitStart();

        var headers = {};
        headers['x-api-key'] = '';
        if(this.$refs.jobFile.files.length > 0)
            headers['x-filename'] = this.$refs.jobFile.files[0].name;

        self = this
        axios({
            url: 'https://unknown.execute-api.us-east-1.amazonaws.com/dev/task_submit',
            method: 'get',
            headers: headers
        }).then(function(res) {
            return res.data;
        }).then(function(json) {
          self.postJobAndUploadFile(json);
        }).catch(function(error) {
          console.log('Error: ', error);
        });

        console.log('Sent request')
    },

    postJobAndUploadFile: function(data){
        var sessionId = data['session_id']
        var self = this;
        if(this.$refs.jobFile.files.length > 0){
            this.uiUploadStart();

            var keys = data['keys']
            var fields = keys['fields']
            var url = keys['url']
            var uploadFormData = new FormData();
            var uploadFieldKeys = Object.keys(fields)
            for (var k = 0; k < uploadFieldKeys.length; ++k) {
                var key = uploadFieldKeys[k]
                var value = fields[key]
                uploadFormData.set(key, value)
            }
            uploadFormData.append('file', this.$refs.jobFile.files[0])
            axios({
                url: url,
                method: 'post',
                headers: {'Content-Type': 'multipart/form-data'},
                data: uploadFormData,
                onUploadProgress: function(progressEvent) {
                  var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                  self.uiUploadProgress(percentCompleted);
                }
            }).then(function(res) {
                self.uiUploadSuccess();
            }).catch(function(error) {
              console.log('Error uploading file: ', error);
            });
        }

        console.log('Sending the job details')
        var jobFormData = new FormData();
        jobFormData.set('email', this.formDataEmail)
        jobFormData.set('price', this.formDataPrice)
        jobFormData.set('message', this.formDataMessage)
        jobFormData.set('session_id', sessionId)

        axios({
            url: 'https://unknown.execute-api.us-east-1.amazonaws.com/dev/task_submit',
            method: 'post',
            headers: {'x-api-key':'', 'Content-Type': 'multipart/form-data'},
            data: jobFormData
        }).then(function(res) {
            self.uiSubmitSuccess();
        }).catch(function(error) {
          console.log('Error submitting the job: ', error);
        });
    }
  }
});
