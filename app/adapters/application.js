import DS from 'ember-data';
import config from 'dev-dashboard/config/environment';

export default DS.RESTAdapter.extend({
  host: config.apiLocation
});
