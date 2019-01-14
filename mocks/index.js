/** @babel */
import path from 'path';
import tmp from 'tmp';
import MockEditor from './mock-editor';

export const files = {
	bad: getFile('bad'),
	empty: getFile('empty'),
	fixable: getFile('fixable'),
	saveFixable: getFile('save-fixable'),
	saveFixableDefault: getFile('save-fixable-default')
};

export const paths = {
	disabled: getPath('disabled'),
	delegated: getPath('delegated'),
	'delegated/disabled': getPath('delegated/disabled'),
	'delegated/enabled': getPath('delegated/enabled'),
	enabled: getPath('enabled'),
	local: getPath('local')
};

export const editors = {
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
