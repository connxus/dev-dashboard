import Ember from 'ember';
import config from 'dev-dashboard/config/environment';

export default Ember.Component.extend({
  socketIOService: Ember.inject.service('socket-io'),
  loading: false,
  users: Ember.A(),
  
  didInsertElement: function() {
    this._super(...arguments);
    
		const socket = this.get('socketIOService').socketFor(config.socketLocation);
    this.set('socket', socket);

    // socket.on('git commit', this.onGitCommit, this);
  },

  onGitCommit({arg}) {
    if (arg.body) {
      const users = this.get('users');

      this.set('loading', true);

      users.push(arg.body)
  
      if (users.length > 5) {
        users.splice(-1,1);
      }
  
      Ember.run.next(() => {
        this.set('loading', false);
        this.set('users', users);
      })
     }
  }

});
