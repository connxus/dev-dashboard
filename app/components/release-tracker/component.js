import Ember from 'ember';

export default Ember.Component.extend({
  title: null,
  desired_end_date: null,
  data: null,
  responseArray: [],
  zenhubApi: Ember.inject.service('zenhub-api'),
  zenhubApp: Ember.inject.service('zenhub-app'),

  didInsertElement(){
    this.send('getAppReleaseData');
  },

  actions: {
    getAppReleaseData() {
      var self = this;
      // var responseArray = [];
      return this.get('zenhubApp').request('', {method: 'GET'}).then(function(response) {
        if (response) {
          var outerTmpArray = [];
          var outerIndex = 0;
          for (let i = response.length - 5; i < response.length - 1; i++) {
            var tmpArray = [];
            tmpArray['release-title'] = response[i].title;

            var prettyDate = null;
            var date = new Date(response[i].desired_end_date)
            prettyDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            tmpArray['deadline'] = prettyDate;

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();

            if(dd<10) {
                dd = '0'+dd
            } 

            if(mm<10) {
                mm = '0'+mm
            } 

            today = mm + '/' + dd + '/' + yyyy;

            var todayArray = today.split('/');
            var todayCalc = new Date(todayArray[2], todayArray[0] - 1, todayArray[1]);
            var prettyDateArray = prettyDate.split('/');
            var prettyDateCalc = new Date(prettyDateArray[2], prettyDateArray[0] - 1, prettyDateArray[1]);
            
            tmpArray['daysLeft'] = Math.trunc((prettyDateCalc - todayCalc)/(1000*60*60*24));

            outerTmpArray[outerIndex] = tmpArray;
            outerIndex ++;
          }
          // console.log(tmpArray);
          self.set('data', outerTmpArray);
          console.log(self.get('data'));
          self.set('title', 'App Releases');
        }
        setTimeout(function() {
          self.send('getApiReleaseData');
        }, 30000)
      });
    },
    getApiReleaseData() {
      var self = this;
      return this.get('zenhubApi').request('', {method: 'GET'}).then(function(response) {
        if (response) {
          self.set('title', 'Api Releases');
          self.set('desired_end_date', response.desired_end_date);
        }
        setTimeout(function() {
          self.send('getAppReleaseData');
        }, 30000)
      });
    }
  }
});
