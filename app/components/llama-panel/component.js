import Ember from 'ember';

export default Ember.Component.extend({
	socketIOService: Ember.inject.service('socket-io'),

  stream: 1,
  totalSteams: 3,

  didInsertElement: function() {
		this._super(...arguments);

		const socket = this.get('socketIOService').socketFor('http://localhost:8080');
    this.set('socket', socket);

		socket.on('llama stream', this.onLlamaStream, this);
  },

  onLlamaStream({ streamNumber }) {
    this.set('stream', parseInt(streamNumber));
  },

  actions: {

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
