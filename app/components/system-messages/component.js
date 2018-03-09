import Ember from 'ember';

export default Ember.Component.extend({
	classNames: ['ui', 'segment'],

	ajax: Ember.inject.service(),
	socketIOService: Ember.inject.service('socket-io'),
	messages: Ember.A(),

	didInsertElement() {
		this._super(...arguments);

		const socket = this.get('socketIOService').socketFor('http://localhost:8080');

		this.set('socket', socket);

		socket.on('system message', this.onSystemMessage, this);
	},

	onSystemMessage({ message }) {
		if ( message ) {
			this.get('messages').pushObject(message);
		}
	},

	actions: {
		postLlamaStream() {
			const ajax = this.get('ajax');
			const streamNumber = this.get('streamNumber');

			ajax.request('/llamaStream', {
				method: 'POST',
				data: { streamNumber }
			}).then(response => {
				console.log('llamaStream response', response);
			});
		}
	}
});
