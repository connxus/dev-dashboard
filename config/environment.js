/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dev-dashboard',
    'ember-websockets': {
      socketIO: true
    },
    environment,
    rootURL: '/',
    locationType: 'auto',
    socketLocation: 'http://localhost:8080',
    apiLocation: 'http://localhost:8080/api',
    moment: {
      // Options:
      // 'all' - all years, all timezones
      // 'subset' - subset of the timezone data to cover 2010-2020 (or 2012-2022 as of 0.5.12). all timezones.
      // 'none' - no data, just timezone API
      includeTimezone: 'all'
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    'ember-websockets': {
      socketIO: true
    },

    zenhubApiLocation: 'https://api.zenhub.io',
    zenhubKey: 'a072f733eb22ee07df6d215ccc4205af286215acac3af162987f7203c9c41ff0d65638ce74ddd0e3'
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.socketLocation = 'https://warm-escarpment-23667.herokuapp.com/';
    ENV.apiLocation = 'https://warm-escarpment-23667.herokuapp.com/api';
  }

  return ENV;
};
