import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';
import config from 'dev-dashboard/config/environment';

export default AjaxService.extend({
  host: config.apiLocation
});
