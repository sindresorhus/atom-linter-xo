const path = require('path')
const tmp = require('tmp')
const MockEditor = require('./mock-editor')

module.exports.files = {
	bad: getFile('bad'),
	empty: getFile('empty'),
	fixable: getFile('fixable'),
	relativePath: getFile('relative-path'),
	saveFixable: getFile('save-fixable'),
	saveFixableDefault: getFile('save-fixable-default')
};

module.exports.paths = {
	disabled: getPath('disabled'),
	delegated: getPath('delegated'),
	'delegated/disabled': getPath('delegated/disabled'),
	'delegated/enabled': getPath('delegated/enabled'),
	enabled: getPath('enabled'),
	local: getPath('local')
};

module.exports.editors = {
	disabled: withPath('disabled'),
	delegated: withPath('delegated'),
	enabled: withPath('enabled')
};

// (file: string) => string
function getFile(name) {
	return require.resolve(path.join(getPath('enabled'), name));
}

// (base: string) => string
function getPath(base) {
	if (base === 'disabled') {
		return path.join(tmp.dirSync().name.toLowerCase());
	}

	return path.join(__dirname, base);
}

// (base: string) => (text: string) => MockEditor<text, base>
function withPath(base) {
	return text => new MockEditor({text, path: getPath(base)});
}
