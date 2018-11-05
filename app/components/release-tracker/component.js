import Ember from 'ember';

export default Ember.Component.extend({
  data: null,
  title: null,
  ajax: Ember.inject.service(),

  didInsertElement(){
    this.send('getAppData');
  },

  actions: {
    getAppData() {
      var self = this;
      return this.get('ajax').request('/cxs-app', {method: 'GET'}).then(function(response) {
        if (response.data) {
          self.set('data', response.data);
          self.set('title', response.title);
        }
      });
    }
  }
});
