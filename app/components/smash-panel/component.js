import Ember from 'ember';

export default Ember.Component.extend({
  hour: Ember.computed('clock.hour', {
    get(){
      var hour = this.get('clock.hour');

      if (hour > 12) {
        return hour - 12;
      } else {
        if (hour === 0) {
          return 12;
        }
        return hour;
      }
    }
  }),

  smashTime: Ember.computed('clock.hour',{
    get(){
      var hour = this.get('clock.hour');

      if (hour === 16 && this.get('didInsertElement')) {
        this.send('playAudio');
        return true;
      } else {
        return false;
      }
    }
  }),

  actions: {
    playAudio() {
      setTimeout(() => {
        var x = document.getElementById("smashAudio"); 
        x.play();
      },1000);
    }
  }
});
