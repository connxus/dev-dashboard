import Ember from 'ember';

export default Ember.Component.extend({
  condition: null,

  thunderStorm: false,
  rain: false,
  snow: false,
  sunny: false,
  cloudy: true,

  didInsertElement() {
    this._super(...arguments);
    this.send('setConditions');
  },

  conditionObserver: Ember.observer('condition', function(){
    this.send('setConditions')
  }),
  actions: {
    setConditions() {
      var condition = this.get('condition');
      
      this.set('thunderStorm', false);
      this.set('rain', false);
      this.set('snow', false);
      this.set('sunny', false);
      this.set('cloudy', false);

      switch (condition) {
        case 'thunderStorm':
          return this.set('thunderStorm', true);
        case 'rain':
          return this.set('rain', true);
        case 'snow':
          return this.set('snow', true);
        case 'sunny':
          return this.set('sunny', true);
        default:
          return this.set('cloudy', true);
      }
    }
  }
});
