import Ember from 'ember';

function simplifySkyCode(code) {
  code = parseInt(code);

  if (
    code === 0 ||
    code === 1 ||
    code === 2 ||
    code === 3 ||
    code === 4 ||
    code === 17 ||
    code === 35
  ) {
    return 'thunderStorm';
  } else if (
    code === 10 ||
    code === 40 ||
    code === 18 ||
    code === 12 ||
    code === 45 ||
    code === 39
  ) {
    return 'rain';
  } else if (
    code === 5 ||
    code === 6 ||
    code === 7 ||
    code === 13 ||
    code === 14 ||
    code === 15 ||
    code === 16 ||
    code === 42 ||
    code === 43 ||
    code === 46 ||
    code === 41
  ) {
    return 'snow';
  } else if (
    code === 31 || code === 32 || code === 36
  ) {
    return 'sunny';
  } else {
    return 'cloudy';
  }
}

export default Ember.Component.extend({
  data: null,
  ajax: Ember.inject.service(),

  didInsertElement(){
    this.send('getRequest');
  },

  currentWeather: Ember.computed('data',{
    get(){
      var data = this.get('data')[0];
      return {
        temp: data.current.temperature,
        obsPoint: data.current.observationpoint,
        wind: data.current.winddisplay,
        text: data.current.skytext,
        condition: simplifySkyCode(data.current.skycode)
      }
    }
  }),

  forecast: Ember.computed('data',{
    get(){
      var self = this;
      var data = this.get('data')[0];
      return data.forecast.map((f) => {
        return {
          temp: f.high,
          day: f.shortday,
          condition: simplifySkyCode(f.skycodeday)
        }
      })
    }
  }),

  actions: {
    getRequest() {
      var self = this;
      return this.get('ajax').request('/weather', {method: 'GET'}).then(function(response) {
        self.set('data', response.weather);
        setTimeout(function() {
          self.send('getRequest');
        },50000);
      });
    }
  }
});
