/** @babel */
import path from 'path';
import {allowUnsafeNewFunction} from 'loophole';
import {CompositeDisposable} from 'atom';

let lintText;
allowUnsafeNewFunction(() => {
	lintText = require('xo').lintText;
});

function lint(textEditor) {
	const filePath = textEditor.getPath();
	let report;

	allowUnsafeNewFunction(() => {
		report = lintText(textEditor.getText(), {cwd: path.dirname(filePath)});
	});

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
}

export function deactivate() {
	this.subscriptions.dispose();
}
