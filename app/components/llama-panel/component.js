import Ember from 'ember';
import config from 'dev-dashboard/config/environment';

export default Ember.Component.extend({
	socketIOService: Ember.inject.service('socket-io'),

  cycle: true,
  cycleTime: 30000,
  stream: 1,
  totalSteams: 3,

  emberYoutube: null,
  ytid: null,
  ytFullscreen: false,
  ytVolume: 0,

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

  fullScreen: Ember.observer('emberYoutube.playerState', 'ytFullscreen', function(){
    var playerState = this.get('emberYoutube.playerState');
    var ytFullscreen = this.get('ytFullscreen');

    console.log('Player State', playerState);
    console.log('Fullscreen', ytFullscreen);

    if (playerState === 'playing' && ytFullscreen) {
      this.send('ytFullscreen');
    }
  }),

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
      var arg2 = arg.split(" ")[1];
      var arg3 = arg.split(" ")[2];

      if ( arg2 === 'stop') {
        this.send('ytEnded');
      } else {
        this.send('getYoutubeId', arg2);

        if (arg3 === 'full' || 'fullscreen') {
          this.set('ytFullscreen', true);
        } else {
          this.set('ytFullscreen', false);
        }

        if (arg3 === 'sound') {
          this.set('ytVolume', 100);
        } else {
          this.set('ytVolume', 0);
        }

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

    ytFullscreen() {
      if (this.get('ytFullscreen')) {
        Ember.$('#EmberYoutube-player')[0].webkitRequestFullscreen();
      }
    },

    ytEnded() {
      this.set('ytid', null);
      this.set('ytFullscreen', false);
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
