import path from 'path';
import tmp from 'tmp';
import MockEditor from './mock-editor';

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

// (base: string) => string
function getPath(base) {
	if (base === 'disabled') {
		return path.join(tmp.dirSync().name.toLowerCase());
	}
	return path.join(process.cwd(), 'fixtures', base);
}

// (base: string) => (text: string) => MockEditor<text, base>
function withPath(base) {
	return text => new MockEditor({text, path: getPath(base)});
}
