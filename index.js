/** @babel */
import path from 'path';
import {CompositeDisposable, Range} from 'atom';
import {allowUnsafeNewFunction} from 'loophole';
import setText from 'atom-set-text';
import pkgDir from 'pkg-dir';
import {sync as loadJson} from 'load-json-file';
import ruleURI from 'eslint-rule-documentation';

const SUPPORTED_SCOPES = [
	'source.js',
	'source.jsx',
	'source.js.jsx'
];

let lintText;
allowUnsafeNewFunction(() => {
	lintText = require('xo').lintText;
});

function lint(textEditor) {
	const filePath = textEditor.getPath();
	let dir = pkgDir.sync(path.dirname(filePath));

	// no package.json
	if (!dir) {
		return [];
	}

	let pkg = loadJson(path.join(dir, 'package.json'));

	// get the parent `package.json` if there's a `"xo": false` in the current one
	while (pkg.xo === false && dir !== null) {
		dir = pkgDir.sync(path.join(dir, '..'));
		pkg = dir === null ? pkg : loadJson(path.join(dir, 'package.json'));
	}

	// `pkg.xo === false` && xo is a dependency && there's no parent `package.json`
	if (dir === null) {
		return [];
	}

	// only lint when `xo` is a dependency
	if (!(pkg.dependencies && pkg.dependencies.xo) &&
		!(pkg.devDependencies && pkg.devDependencies.xo)) {
		return [];
	}

	// ugly hack to workaround ESLint's lack of a `cwd` option
	// TODO: remove this when https://github.com/sindresorhus/atom-linter-xo/issues/19 is resolved
	const defaultCwd = process.cwd();
	process.chdir(dir);

	let report;
	allowUnsafeNewFunction(() => {
		report = lintText(textEditor.getText(), {
			cwd: dir,
			filename: filePath
		});
	});

	process.chdir(defaultCwd);

	const textBuffer = textEditor.getBuffer();

	return report.results[0].messages.map(x => {
		let fix;

		if (x.fix) {
			fix = {
				range: new Range(
					textBuffer.positionForCharacterIndex(x.fix.range[0]),
					textBuffer.positionForCharacterIndex(x.fix.range[1])
				),
				newText: x.fix.text
			};
		}

		const ret = {
			filePath,
			fix,
			type: x.severity === 2 ? 'Error' : 'Warning',
			html: `<span>${x.message} (<a href=${ruleURI(x.ruleId || '').url}>${x.ruleId}</a>)</span>`
		};

		// some messages don't have these
		if (typeof x.line === 'number' && typeof x.column === 'number') {
			ret.range = [
				[x.line - 1, x.column - 1],
				[x.line - 1, x.column - 1]
			];
		}

		return ret;
	});
}

const fix = () => {
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

	const output = report.results[0].output;

	if (output) {
		setText(output);
	}
};

export function provideLinter() {
	return {
		name: 'XO',
		grammarScopes: SUPPORTED_SCOPES,
		scope: 'file',
		lintOnFly: true,
		lint
	};
}

export function activate() {
	require('atom-package-deps').install('linter-xo');

	this.subscriptions = new CompositeDisposable();
	this.subscriptions.add(atom.commands.add('atom-text-editor', {
		'XO:Fix': fix
	}));

	atom.workspace.observeTextEditors(editor => {
		editor.getBuffer().onWillSave(() => {
			const isJS = SUPPORTED_SCOPES.includes(editor.getGrammar().scopeName);
			const shouldFixOnSave = atom.config.get('linter-xo.fixOnSave');

			if (isJS && shouldFixOnSave) {
				fix();
			}
		});
	});
}

export function deactivate() {
	this.subscriptions.dispose();
}

export const config = {
	fixOnSave: {
		type: 'boolean',
		default: false
	}
};
