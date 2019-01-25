/** @babel */
import {CompositeDisposable} from 'atom';
import {install} from 'atom-package-deps';
import fix from './lib/fix';
import format from './lib/format';
import lint from './lib/lint';

const SUPPORTED_SCOPES = [
	'source.js',
	'source.jsx',
	'source.js.jsx',
	'source.ts',
	'source.tsx'
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

	this.subscriptions.add(atom.workspace.observeTextEditors(editor => {
		editor.getBuffer().onWillSave(() => {
			if (!atom.config.get('linter-xo.fixOnSave')) {
				return;
			}

			const {scopeName} = editor.getGrammar();

			if (!SUPPORTED_SCOPES.includes(scopeName)) {
				return;
			}

			return fix(editor)(editor.getText(), atom.config.get('linter-xo.rulesToDisableWhileFixingOnSave'));
		});
	}));
}

export const config = {
	fixOnSave: {
		type: 'boolean',
		default: false
	},
	rulesToDisableWhileFixingOnSave: {
		title: 'Disable specific rules while fixing on save',
		description: 'Prevent rules from being auto-fixed by XO. Applies to fixes made on save but not when running the `XO:Fix` command.',
		type: 'array',
		default: [
			'capitalized-comments',
			'ava/no-only-test',
			'ava/no-skip-test'
		],
		items: {
			type: 'string'
		}
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
		lintsOnChange: true,
		lint: async editor => {
			const result = await lint(editor)(editor.getText());
			return format(editor)(result);
		}
	};
}
