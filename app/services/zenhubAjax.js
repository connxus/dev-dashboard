import Ember from 'ember';
import AjaxService from 'ember-ajax/services/zenhubAjax';
import config from 'dev-dashboard/config/environment';

export default AjaxService.extend({
  host: config.zenhubApi
});
