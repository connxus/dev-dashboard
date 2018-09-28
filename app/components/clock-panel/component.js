import Ember from 'ember';
import moment from 'moment';


export default Ember.Component.extend({
  namespace: '/',

  amOrPm: 'AM',

  // didInsertElement() {
  //   this._super(...arguments);
  //
  //   /*
  //     2. The next step you need to do is to create your actual socketIO.
  //   */
  //   const socket = this.get('socketIOService').socketFor('http://localhost:8000/');
  //
  //   socket.on('issueMoved ', () => {
  //     console.log("ISSUED MOVED");
  //   });
  // },

  date: Ember.computed({
    get(){
      return moment().format('dddd, MMMM Do YYYY');
    }
  }),

  hour: Ember.computed('clock.hour', {
    get(){
      var hour = this.get('clock.hour');

      if (hour > 12) {
        this.set('amOrPm', 'PM');
        return hour - 12;
      } else {
        this.set('amOrPm', 'AM');
        if (hour === 0) {
          return 12;
        }
        return hour;
      }
    }
  }),
  
  minute: Ember.computed('clock.minute', {
    get() {
      var minute = this.get('clock.minute');

      if (minute < 10) {
        return '0' + minute
      } else {
        return minute
      }
    }
  })

});
