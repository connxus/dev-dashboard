import Ember from 'ember';
import config from 'dev-dashboard/config/environment';

export default Ember.Component.extend({
	socketIOService: Ember.inject.service('socket-io'),

  cycle: true,
  cycleTime: 30000,
  stream: 1,
  totalSteams: 4,

  emberYoutube: null,
  ytid: null,
  ytVolume: 0,
  fullscreen: false,
  ytLoaded: false,

  ytStyle: 'height: 500px',
  ytStyleObserver: Ember.observer('fullscreen', function(){
    if(this.get('fullscreen')){
      this.set('ytStyle', 'height: 100vh;') 
    } else {
      this.set('ytStyle', 'height: 500px;') 
    }
  }),

  ytTimeObserver: Ember.observer('ytLoaded','time', function(){
    let self = this
      if(this.get('emberYoutube') && this.get('time') && this.get('ytLoaded')){
        var emberYT = this.get('emberYoutube')
        emberYT.send('seekTo', self.get('time'));
      }
  }),

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
      var arg2 = arg.split(" ")[1];
      var arg3 = arg.split(" ")[2];

      if ( arg2 === 'stop') {
        this.send('ytEnded');
      } else if ( arg2 === 'fullscreen' || arg2 === 'full' ) {
        this.set('fullscreen', true);
      } else if ( arg2 === 'minimize' || arg2 === 'mini' ) {
        this.set('fullscreen', false);
      } else if ( arg2 === 'sound' ) {
        // TURN UP VOLUME
        if (this.get('emberYoutube')) {
          this.set('emberYoutube.volume', 100);
        }
        this.set('volume', 100);
      } else if ( arg2 === 'mute') {
        // MUTE AUDIO
        if (this.get('emberYoutube')) {
          this.set('emberYoutube.volume', 0);
        }
        this.set('volume', 0);
      } else {
        if (arg3 === 'sound') {
          this.set('ytVolume', 100);
        } else {
          this.set('ytVolume', 0);
        }
        if (arg3 === 'fullscreen' || arg3 === 'full') {
          this.set('fullscreen', true);
        } else {
          this.set('fullscreen', false);
        }

        this.send('getYoutubeId', arg2);
      }

      return;
    }

    this.set('stream', parseInt(arg));
  },

  actions: {

    getYoutubeId(url) {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      var time = /(t=|start=)(\d+)/;
      var match = url.match(regExp);
      var timeMatch = url.match(time);
  
      if (match && match[2].length == 11) {
          this.set('ytid', match[2]);
      } else {
          this.set('ytid', null);
          return 'error';
      }
      
        if (timeMatch && timeMatch[2].length) {
          this.set('time', timeMatch[2]);
      } else {
          this.set('time', null);
          return 'error';
      }
    },

    ytStarted(){
      if(!this.get('ytLoaded')){
        this.set('ytLoaded', true)
      }
    },

    ytEnded() {
      this.set('ytid', null);
      this.set('fullscreen', false);
      this.set('ytLoaded', false)
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