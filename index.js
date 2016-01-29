/** @babel */
import fs from 'fs';
import path from 'path';
import {CompositeDisposable} from 'atom';
import {allowUnsafeNewFunction} from 'loophole';
import setText from 'atom-set-text';
import pkgDir from 'pkg-dir';

let lintText;
allowUnsafeNewFunction(() => {
	lintText = require('xo').lintText;
});

function lint(textEditor) {
	const filePath = textEditor.getPath();
	let report;

	const dir = pkgDir.sync(path.dirname(filePath));

	// no package.json
	if (!dir) {
		return [];
	}

	// check if package.json has 'xo'
	const rgx = new RegExp('xo', 'g');
	const pkg = fs.readFileSync(path.join(dir, 'package.json'), 'utf8');
	if (!rgx.test(pkg)) {
		return [];
	}

	// ugly hack to workaround ESLint's lack of a `cwd` option
	const defaultCwd = process.cwd();
	process.chdir(dir);

	allowUnsafeNewFunction(() => {
		report = lintText(textEditor.getText(), {cwd: dir});
	});

	process.chdir(defaultCwd);

	const ret = [];

	report.results.forEach(result => {
		result.messages.forEach(x => {
			ret.push({
				filePath,
				type: x.severity === 2 ? 'Error' : 'Warning',
				text: `${x.message} (${x.ruleId})`,
				range: [
					[x.line - 1, x.column - 1],
					[x.line - 1, x.column - 1]
				]
			});
		});
	});

	return ret;
}

export const provideLinter = () => ({
	name: 'xo',
	grammarScopes: [
		'source.js',
		'source.jsx',
		'source.js.jsx'
	],
	scope: 'file',
	lintOnFly: true,
	lint
});

export function activate() {
	require('atom-package-deps').install();

	this.subscriptions = new CompositeDisposable();
	this.subscriptions.add(atom.commands.add('atom-text-editor', {
		'XO:Fix': () => {
			const editor = atom.workspace.getActiveTextEditor();

			if (!editor) {
				return;
			}

			let report;

			allowUnsafeNewFunction(() => {
				report = lintText(editor.getText(), {
					fix: true,
					cwd: path.dirname(editor.getPath())
				});
			});

			setText(report.results[0].output);
		}
	}));
}

export function deactivate() {
	this.subscriptions.dispose();
}
