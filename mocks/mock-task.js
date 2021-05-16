const {Emitter} = require('event-kit');

const privateSpace = new WeakMap();

module.exports.processMessages = task => {
	const {emitter, messages} = privateSpace.get(task);

	for (const {id, ...message} of messages) {
		emitter.emit(id, message);
	}
};

module.exports.MockTask = class MockTask {
	constructor() {
		const messages = [];
		privateSpace.set(this, {
			childProcess: {connected: false},
			emitter: new Emitter(),
			messages
		});
	}

	get childProcess() {
		const {childProcess} = privateSpace.get(this);
		return {...childProcess};
	}

	on(event, callback) {
		const {emitter} = privateSpace.get(this);
		return emitter.on(event, callback);
	}

	send(message) {
		const {messages} = privateSpace.get(this);
		return messages.push(message);
	}

	start() {
		const {childProcess} = privateSpace.get(this);
		childProcess.connected = true;
	}

	terminate() {
		const {childProcess} = privateSpace.get(this);
		childProcess.connected = false;
	}
};
