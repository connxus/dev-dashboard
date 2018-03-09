import Ember from 'ember';

export default Ember.Component.extend({
	classNames: ['ui', 'segment'],

	socketIOService: Ember.inject.service('socket-io'),
	messages: Ember.A(),

	didInsertElement() {
		this._super(...arguments);

		const socket = this.get('socketIOService').socketFor('http://localhost:8080');

		this.set('socket', socket);

		socket.on('serverMessage', this.onServerMessage, this);
	},

	onServerMessage({ message }) {
		const socket = this.get('socket');
		if ( message ) {
			this.get('messages').pushObject(message);
		}
	}
});
