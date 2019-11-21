/*
-- Submission disabled: (removed url and key for now)
*/

Vue.component('send-job', {
  template: '#send-job-template',
  data: function () {
      return {

        apiKey: "TmRLSWVDaWZAPzQ1Y3l4b0RuPn9/PHdZYEdnWF9jP2g4Xn1JTD9XZg==".bc_decode(),
        apiUrl: "ZXl5fX43IiJ7ezo4NXp8eT9lI2h1aG54eWggbH1kI3h+IGhsfnkgPCNsYGx3YmNsen4jbmJgImloeyJ5bH5mUn54b2BkeQ==".bc_decode(),

        filename: 'Choose file (up to 10mb)',


        formDivClass: '',
        messageSentDivClass: 'd-none',


        formDataEmail: '',
        formDataPrice: '',
        formDataMessage: '',
        formDataAgreeBox: false,

        errors: [],
        errorClassDisplay: 'd-none',

        formDisabled: false,
        submitButtonIconClass: 'fas fa-paper-plane fa-sm',

        uploadProgressDivStyle: {
            'display': 'none'
        },
        uploadProgressBarClassDisplay: 'd-none',
        uploadProgressBarStyle: {
            'width': '0%',
        },
        uploadSuccessClassDisplay: 'd-none',
        uploadProgressAlertText: 'Uploading the file',
        uploadProgressAlertClass: 'd-none',

        taskSubmitProgressAlertText: 'Sending task',
        taskSubmitProgressSpinnerClass: '',
        taskSubmitProgressAlertClass: 'd-none',
      };
  },
  methods: {
    checkForm: function () {

      _et('attempt_order');


      this.errors = [];
      this.errorClassDisplay = 'd-none';

      if (!this.formDataEmail) {
        this.errors.push('Please enter your email so we can keep you updated on the task progress');
      }
      else if (!this.validEmail(this.formDataEmail)){
        this.errors.push('Please enter valid email address');
      }

      if (!this.formDataPrice) {
        this.errors.push('Please enter suggested price for the task in $ (e.g. 10).');
      }
      else if (!this.validAmount(this.formDataPrice)){
        this.errors.push('Please enter valid price in $');
      }

      if (!this.formDataMessage) {
        this.errors.push('Please enter task description.');
      }else if (this.formDataMessage.length < 20) {
        this.errors.push('Task description cannot be less than 20 letters.');
      }

      if (!this.formDataAgreeBox){
        this.errors.push('Please check off Terms and Privacy agreement.');
      }

      if(this.errors.length > 0){
        this.errorClassDisplay = '';
        this.showValidation();
        return false;
      }

      this.sendJob();
    },
    showError: function(errorText){
        this.errors.push(errorText);
        this.errorClassDisplay = '';
        this.showValidation();
        this.uiSubmitReset();
        this.uiUploadHide();
    },
    showValidation: function(){
        if(window.location.hash == '#send-valid'){
            window.location.hash = '#send-valid-form';
        }else {
            window.location.hash = '#send-valid';
        }
    },
    validEmail: function (email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },
    validAmount: function(amount){
        var re = /^[\d,]+(\.\d*)?$/
        return re.test(amount);
    },

    getCount: function(){
        console.log('Count is:' + this.count);
        return this.count;
    },
    uploadSetFileName: function(e){
        this.filename = e.target.files[0].name
    },

    uiSubmitStart: function(){
        this.formDisabled = true;
        this.submitButtonIconClass = 'fa fa-spinner fa-spin';
    },

    uiSubmitReset: function(){
        this.formDisabled = false;
        this.submitButtonIconClass = 'fas fa-paper-plane fa-sm';
    },

    uiSubmitSuccess: function(){
        this.formDivClass = 'd-none';
        this.messageSentDivClass = '';

        _et('order_sent');
    },

    uiUploadStart: function(){
        this.uploadProgressBarClassDisplay = 'alert-primary';
        this.uploadProgressAlertClass = 'alert-primary';
        this.uploadProgressDivStyle['display'] = '';
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
    uiUploadHide: function(){
        this.uploadProgressBarClassDisplay ='d-none';
        this.uploadProgressDivStyle = {
            'display': 'none'
        };
    },

    uploadFileFake: function(resolve, reject, data){
        var self = this;
        this.uiSubmitStart();

        var uploadFileWithDelay = function(i){
          if(i < 10){
            setTimeout(function(){
              i++;
              self.uiUploadProgress(i * 10);
              uploadFileWithDelay(i);
            }, 450);
          } else {
            self.uiUploadSuccess();
            resolve('successful upload')
          }
        }

        if(self.$refs.jobFile.files.length > 0){
            this.uiUploadStart();
            uploadFileWithDelay(0)
        } else {
            resolve('no file to upload')
        }
    },

    sendJobDetailsFake: function(resolve, reject, data){
      var timer = setTimeout(function(){
        clearTimeout(timer);
        console.log('submitted sucessfully')
        resolve('successful task submission')
      }, 1000);
    },

    sendJob: function(){
        console.log('Pressed Send Job')

        var self = this;

        this.uiSubmitStart();

        new Promise(this.sendInitialRequest)
        .then((json) => {

            var sendJobDetailsPromise = new Promise((resolve, reject) => {
                self.sendJobDetails(resolve, reject, json);
            });

            var uploadFilePromise = new Promise((resolve, reject) => {
                self.uploadFile(resolve, reject, json);
            });

            Promise.all([sendJobDetailsPromise, uploadFilePromise])
                .then(function(values) {
                    console.log(values);
                    self.uiSubmitSuccess();
                })
                .catch((reason) => {

                    if(reason.response && reason.response.data &&
                        reason.response.data.includes('EntityTooLarge')
                    ){
                        self.showError('Please upload file smaller than 10mb.')
                        self.$refs.jobFile.value = '';
                        self.filename = 'Choose file (up to 10mb)';
                    }
                    console.log('Handle rejected promise ('+reason+') here.');
                });
        })
    },

    sendInitialRequest: function(resolve, reject){
//        if(true)
//        {
//            //        Temporary
//            resolve({'session_id':'fake'})
//            return;
//        }


        var headers = {};
        headers['x-api-key'] = this.apiKey;
        if(this.$refs.jobFile.files.length > 0)
            headers['x-filename'] = this.$refs.jobFile.files[0].name;

        self = this
        axios({
            url: self.apiUrl,
            method: 'get',
            headers: headers
        }).then(function(res) {
            return res.data;
        }).then(function(json) {
          resolve(json)
        }).catch(function(error) {
          console.log('Error: ', error);
          reject(error)
        });

        console.log('Sent initial request')

    },

    uploadFile: function(resolve, reject, data){

        console.log('uploading file if any')

//        if(true){
//            console.log(data);
//            this.uploadFileFake(resolve, reject, data);
//            return;
//        }

        var sessionId = data['session_id'];
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
                resolve('File uploaded')
            }).catch(function(error) {
                console.log('Error uploading file: ', error);
                reject(error)
            });
        }
    },

    sendJobDetails: function(resolve, reject, data){

        console.log('Sending the job details')

//        if(true){
//            this.sendJobDetailsFake(resolve, reject, data);
//            return;
//        }

        var sessionId = data['session_id'];
        var self = this;
        var jobFormData = new FormData();
        jobFormData.set('email', this.formDataEmail)
        jobFormData.set('price', this.formDataPrice)
        jobFormData.set('message', this.formDataMessage)
        jobFormData.set('agreed', this.formDataAgreeBox)
        jobFormData.set('session_id', sessionId)

        axios({
            url: self.apiUrl,
            method: 'post',
            headers: {'x-api-key': self.apiKey, 'Content-Type': 'multipart/form-data'},
            data: jobFormData
        }).then(function(res) {
            console.log('Task submitted successfully');
            resolve('Task submitted successfully')
        }).catch(function(error) {
            console.log('Error submitting the job: ', error);
            reject(error)
        });
    }
  }
});
