/** @babel */
import {CompositeDisposable} from 'atom';
import {install} from 'atom-package-deps';
import fix from './lib/fix';
import format from './lib/format';
import lint from './lib/lint';

const SUPPORTED_SCOPES = [
	'source.js',
	'source.jsx',
	'source.js.jsx'
];

export function activate() {
	install('linter-xo');

	this.subscriptions = new CompositeDisposable();
	this.subscriptions.add(atom.commands.add('atom-text-editor', {
		'XO:Fix': () => {
			const editor = atom.workspace.getActiveTextEditor();

			if (!editor) {
				return;
			}

			fix(editor)(editor.getText());
		}
	}));

	this.subscriptions.add(
		atom.workspace.observeTextEditors(editor => {
			editor.getBuffer().onWillSave(() => {
				if (!atom.config.get('linter-xo.fixOnSave')) {
					return;
				}

				const {scopeName} = editor.getGrammar();

				if (!SUPPORTED_SCOPES.includes(scopeName)) {
					return;
				}

				const text = editor.getText();
				return fix(editor)(text);
			});
		})
	);
}

export const config = {
	fixOnSave: {
		type: 'boolean',
		default: false
	}
};

export function deactivate() {
	this.subscriptions.dispose();
}

export function provideLinter() {
	return {
		name: 'XO',
		grammarScopes: SUPPORTED_SCOPES,
		scope: 'file',
		lintOnFly: true,
		lint: editor => {
			lint(editor)(editor.getText()).then(format(editor));
		}
	};
}
