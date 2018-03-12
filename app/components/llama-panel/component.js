import Ember from 'ember';
import config from 'dev-dashboard/config/environment';

export default Ember.Component.extend({
	socketIOService: Ember.inject.service('socket-io'),

  cycle: true,
  cycleTime: 30000,
  stream: 1,
  totalSteams: 3,

  didInsertElement: function() {
		this._super(...arguments);

		const socket = this.get('socketIOService').socketFor(config.socketLocation);
    this.set('socket', socket);

    socket.on('llama stream', this.onLlamaStream, this);

    Ember.run.later(this, function() {
      if ( this.get('cycle') === true ) {
        this.runCycle();
      }
    }, this.get('cycleTime'));
  },

  runCycle() {
    this.send('nextStream');

    Ember.run.later(this, function() {
      if ( this.get('cycle') === true ) {
        this.runCycle();
      }
    }, this.get('cycleTime'));
  },

  onLlamaStream({ arg }) {
    if ( arg === 'cycle' ) {
      this.set('cycle', true);
      return;
    }
    if ( arg === 'freeze' ) {
      this.set('cycle', false);
      return;
    }

    this.set('stream', parseInt(arg));
  },

  actions: {

    toggleCycle() {
      this.toggleProperty('cycle');
    },

    nextStream() {
      const stream = this.get('stream');
      const totalStreams = this.get('totalSteams');

      if ( stream >= totalStreams ) {
        this.set('stream', 1);
      } else {
        this.set('stream', stream + 1);
      }
    },

    prevStream() {
      const stream = this.get('stream');
      const totalStreams = this.get('totalSteams');

      if ( stream <= 1 ) {
        this.set('stream', totalStreams );
      } else {
        this.set('stream', stream - 1);
      }
    }

  }
});
