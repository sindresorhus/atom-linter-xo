const assert = require('assert');
const TextBuffer = require('text-buffer');

const privateSpace = new WeakMap();

module.exports = class MockEditor {
	// (Object) => Object
	constructor(options) {
		assert(typeof options.path === 'string', msg('options.path', 'string', options.path));
		assert(typeof options.path === 'string', msg('options.buffer', 'string', options.path));

		privateSpace.set(this, {
			options,
			buffer: new TextBuffer({text: options.text}),
			path: options.path
		});
	}

	getBuffer() {
		const {buffer} = privateSpace.get(this);
		return buffer;
	}

	getPath() {
		const {path} = privateSpace.get(this);
		return path;
	}

	getText() {
		const {buffer} = privateSpace.get(this);
		return buffer.getText();
	}
};

// (name: string, value: any) => string
function msg(name, expected, value) {
	return `MockEditor: ${name} must be of type ${expected}, received value "${value}" with value ${typeof value}`;
}
