import Ember from 'ember';

export default Ember.Component.extend({
  appIssues: null,
  appTitles: null,
  apiIssues: null,
  apiTitle: null,
  ajax: Ember.inject.service(),
  appChartData: {
    labels: Ember.A(),
    datasets: Ember.A()
  },

  options: {
    scales: {
      xAxes: [{ stacked: true }],
      yAxes: [{ stacked: true }]
    },
    legend: {
      labels: {
        fontColor: 'white',
        defaultFontSize: 24,
        defaultFontStyle: 'bold'
      }
    }
  },

  didInsertElement(){
    this.send('getAppData');
  },

  actions: {
    getAppData() {
      var self = this;
      let appChartDataArr = Ember.A();

      this.get('ajax').request('/cxs-app', {method: 'GET'}).then(function(response) {
        if (response.data) {
          self.set('appTitle', response.data.map(issue => issue.name));
          self.set('appIssues', response.data.map(issue => issue.issueLength));
        };

        self.set('appChartData.labels', self.get('appTitle'));

        appChartDataArr.push({
          label: 'App Tickets',
          data: self.get('appIssues'),
          backgroundColor: 'rgb(65,149,238)'
        });

        Ember.run.later(() => {
          self.set('appChartData.datasets', appChartDataArr);        
        },5000)
      });

      this.get('ajax').request('/cxs-api', {method: 'GET'}).then(function(response) {
        if (response.data) {
          console.log(response.data)
          self.set('apiTitle', response.data.map(issue => issue.name));
          self.set('apiIssues', response.data.map(issue => issue.issueLength));
        };

        appChartDataArr.push({
          label: 'Api Tickets',
          data: self.get('apiIssues'),
          backgroundColor: 'rgb(68,218,116)'
        });

        Ember.run.later(() => {
          self.set('appChartData.datasets', appChartDataArr);          
        },5000)
      });

      setTimeout(function() {
        this.set('appChartData.datasets', Ember.A());
        self.send('getAppData');
      }, 30000);
    }
  }
});
