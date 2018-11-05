import Ember from 'ember';

export default Ember.Component.extend({
  data: null,
  title: null,
  ajax: Ember.inject.service(),

  didInsertElement(){
    this.send('getAppReleaseData');
  },

  actions: {
    getAppReleaseData() {
        var self = this;
        return this.get('ajax').request('/cxs-app', {method: 'GET'}).then(function(response) {
        if (response.data) {
            self.set('release-due-date', response.title);
        }
        setTimeout(function() {
            self.send('getApiReleaseData');
            }, 30000);
        });
    },
    getApiReleaseData() {
        var self = this;
        return this.get('ajax').request('/cxs-app', {method: 'GET'}).then(function(response) {
            if (response.data) {
            self.set('release-due-date', response.title);
            }
            setTimeout(function() {
                self.send('getAppReleaseData');
            }, 30000);
        });
    }
  }
});
