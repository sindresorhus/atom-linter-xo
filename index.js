/** @babel */
import path from 'path';
import {CompositeDisposable, Range} from 'atom';
import {install} from 'atom-package-deps';
import setText from 'atom-set-text';
import pkgDir from 'pkg-dir';
import {sync as loadJson} from 'load-json-file';
import ruleURI from 'eslint-rule-documentation';
import lint from './lint';

export function provideLinter() {
	return {
		name: 'XO',
		grammarScopes: [
			'source.js',
			'source.jsx',
			'source.js.jsx'
		],
		scope: 'file',
		lintOnFly: true,
		lint: editor => {
			const lint = getEditorLint(editor);
			const format = getEditorFormat(editor);
			return lint().then(format);
		}
	};
}

export function activate() {
	install('linter-xo');

	this.subscriptions = new CompositeDisposable();

	const command = atom.commands.add('atom-text-editor', {
		'XO:Fix': () => {
			const editor = atom.workspace.getActiveTextEditor();

			if (!editor) {
				return;
			}

			const lint = getEditorLint(editor);
			const fix = getEditorFix();
			return lint().then(fix);
		}
	});

	this.subscriptions.add(command);
}

export function deactivate() {
	if (this.subscriptions) {
		this.subscriptions.dispose();
	}
}

function getEditorFix() {
	return report => {
		const [result] = report.results;
		if (result.output) {
			setText(result.output);
		}
	};
}

function getEditorFormat(editor) {
	const buffer = editor.getBuffer();
	const filePath = editor.getPath();

	return report => {
		const [result] = report.results;
		return result.messages.map(message => {
			return {
				filePath,
				fix: selectMessageFix(message, buffer),
				type: selectMessageType(message),
				html: selecMessageHtml(message),
				range: selectMessageRange(message)
			};
		});
	};
}

function getEditorLint(editor) {
	return () => {
		const filePath = editor.getPath();
		const packageDirectory = pkgDir.sync(path.dirname(filePath));

		if (!packageDirectory) {
			return [];
		}

		const pkg = getXOPackageJson(packageDirectory);

		if (pkg.dir === null) {
			return [];
		}

		const deps = pkg.data.dependencies || {};
		const devDeps = pkg.data.devDependencies || {};

		// only lint when `xo` is a dependency
		if (!('xo' in deps) && !('xo' in devDeps)) {
			return [];
		}

		const opts = {cwd: pkg.dir, config: pkg.data.xo, filename: editor.getPath()};
		return performLint(editor.getText(), opts);
	};
}

function selectMessageRange(message) {
	if (typeof message.line !== 'number' || typeof message.column !== 'number') {
		return null;
	}
	const y = message.line - 1;
	const x = message.column - 1;
	const cursor = [y, x];
	return [cursor, cursor];
}

function selectMessageType(message) {
	return message.severity === 2 ? 'Error' : 'Warning';
}

function selecMessageHtml(message) {
	return `<span>${message.message} (<a href=${ruleURI(message.ruleId || '').url}>${message.ruleId}</a>)</span>`;
}

function selectMessageFix(message, buffer) {
	if (!message.fix) {
		return null;
	}

	const [fixStart, fixEnd] = message.fix.range || [null, null];
	const startPos = buffer.positionForCharacterIndex(fixStart);
	const endPos = buffer.positionForCharacterIndex(fixEnd);

	return {
		range: new Range(startPos, endPos),
		newText: message.fix.text
	};
}

function performLint(text, opts) {
	const payload = {text, opts};
	return lint(payload);
}

function getXOPackageJson(dir) {
	let data = loadJson(path.join(dir, 'package.json'));

	// get the parent `package.json` if there's a `"xo": false` in the current one
	while (data.xo === false && dir !== null) {
		dir = pkgDir.sync(path.join(dir, '..'));
		data = dir === null ? data : loadJson(path.join(dir, 'package.json'));
	}

	return {dir, data};
}
