import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  zenhubApi: Ember.inject.service('zenhub-api'),
  zenhubApp: Ember.inject.service('zenhub-app'),

  errorMessage: '',
  error: false,

  title: null,
  data: null,

  didInsertElement(){
    Ember.run.scheduleOnce('afterRender', this, this.getApiReleaseData);
  },

  errorOutput( error ) {
      this.set('error', true);
      this.set('title', error.name);
      this.set('errorMessage', `<div style="max-height:300px;overflow-y:scroll;overflow-x:hidden;">
        <p>${error.message}</p>
        <div>${error.payload}</div>
        <div><pre>${error.stack}</pre></div>
      </div>`);
  },

  getApiReleaseData() {
    return this.get('zenhubApi').request('reports/releases', {method: 'GET'}).then(response => {

      if (response) {
        this.set('title', 'Releases');

        const data = Ember.A(response)
          .filter(release => release.state === 'open')
          .map(release => {
            const m = moment(release.desired_end_date);
            release['deadline'] = m.format('MM/DD/YYYY');
            release['daysLeft'] = moment().diff(m, 'days');
            release['humanReadable'] = m.fromNow();
            console.log(release);
            return release;
          })
          .sortBy('daysLeft')
          .reject((release, i) => i > 1);

        console.log(data);

        this.set('data', data);
      }

      setTimeout(() => {
        this.getApiReleaseData.call(this);
      }, (5*60)*1000);
    }).catch( this.errorOutput.bind(this) );
  }
});
