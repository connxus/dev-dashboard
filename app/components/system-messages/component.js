import Ember from 'ember';
import config from 'dev-dashboard/config/environment';

export default Ember.Component.extend({
	classNames: [],

	ajax: Ember.inject.service(),
	socketIOService: Ember.inject.service('socket-io'),
	messages: Ember.A(),

	didInsertElement() {
		this._super(...arguments);

		const socket = this.get('socketIOService').socketFor(config.socketLocation);

		this.set('socket', socket);

		socket.on('system message', this.onSystemMessage, this);
	},

	onSystemMessage({ message }) {
		if ( message ) {
			this.get('messages').pushObject(message);

			Ember.run.later(this, function() {
				this.get('messages').removeObject( message );
			}, 15000);
		}
	}
});
