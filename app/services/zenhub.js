import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';
import config from 'dev-dashboard/config/environment';

export default AjaxService.extend({
  host: config.zenhubApiLocation,
  namespace: 'p1/repositories/26181661/reports/releases',
  headers: {
    'X-Authentication-Token': config.zenhubKey
  }
});
