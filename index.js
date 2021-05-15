const {CompositeDisposable} = require('atom');
const {install} = require('atom-package-deps');
const fix = require('./lib/fix.js');
const format = require('./lib/format.js');
const {lint, startWorker, stopWorker} = require('./lib/worker.js');

const SUPPORTED_SCOPES = [
	'source.js',
	'source.jsx',
	'source.js.jsx',
	'source.ts',
	'source.tsx'
];

module.exports.activate = function () {
	startWorker();
	install('linter-xo');

	this.subscriptions = new CompositeDisposable();

	this.subscriptions.add(atom.commands.add('atom-text-editor', {
		'XO:Fix': () => {
			const editor = atom.workspace.getActiveTextEditor();

			if (!editor) {
				return;
			}

			fix(editor, lint)(editor.getText());
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

			return fix(editor, lint)(editor.getText(), atom.config.get('linter-xo.rulesToDisableWhileFixingOnSave'));
		});
	}));
};

module.exports.config = {
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

module.exports.deactivate = function () {
	this.subscriptions.dispose();
	stopWorker();
};

module.exports.provideLinter = function () {
	return {
		name: 'XO',
		grammarScopes: SUPPORTED_SCOPES,
		scope: 'file',
		lintsOnChange: true,
		lint: async editor => {
			const result = await lint(editor.getPath())(editor.getText());
			return format(editor)(result);
		}
	};
};
