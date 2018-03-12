import Ember from 'ember';
import config from 'dev-dashboard/config/environment';

export default Ember.Component.extend({
	socketIOService: Ember.inject.service('socket-io'),

  cycle: true,
  cycleTime: 30000,
  stream: 1,
  totalSteams: 3,
  ytid: null,

  myPlayerVars: {
    autoplay: 1,
    showinfo: 0
  },

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
      this.runCycle.call(this);
      return;
    }
    if ( arg === 'freeze' ) {
      this.set('cycle', false);
      return;
    }

    if ( arg.split(" ")[0] === 'youtube' ) {
      var arg2 = args.split(" ")[1];

      if ( arg2 === 'stop') {
        this.send('ytEnded');
      } else {
        this.send('getYoutubeId', arg.split(" ")[1]);
      }

      return;
    }

    this.set('stream', parseInt(arg));
  },

  actions: {

    getYoutubeId(url) {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      var match = url.match(regExp);
  
      if (match && match[2].length == 11) {
          this.set('ytid', match[2]);
      } else {
          this.set('ytid', null);
          return 'error';
      }
    },

    ytEnded() {
      this.set('ytid', null);
    },

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
