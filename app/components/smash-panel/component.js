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

      if (hour === 16) {
        return true;
      } else {
        return false;
      }
    }
  })
});
