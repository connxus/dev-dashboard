import Ember from 'ember';
// import twitch from './twitch';

export default Ember.Component.extend({
  channel: 'GamesDoneQuick',
  allowfullscreen: true,
  height: 480,
  width: 854,
  layout: 'video',
  fullscreen: false,

  didInsertElement() {
    new Twitch.Embed("twitch-embed", {
      width: this.get('width'),
      height: this.get('height'),
      channel: this.get('channel'),
      layout: this.get('layout')
    });
  }
});
