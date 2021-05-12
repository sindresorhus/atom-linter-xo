const {files} = require('../mocks');
const {provideLinter} = require('..');

describe('xo provider for linter', () => {
	const {lint} = provideLinter();
	const cmd = (editor, name) => atom.commands.dispatch(atom.views.getView(editor), name);

	const fix = async editor => {
		cmd(editor, 'XO:Fix');

		return new Promise(resolve => {
			editor.onDidChange(() => {
				resolve(editor);
			});
		});
	};

	beforeEach(async () => {
		await atom.packages.activatePackage('language-javascript');
		await atom.packages.activatePackage('linter-xo');
	});

	describe('checks bad.js and', () => {
		it('finds at least one message', async () => {
			const editor = await atom.workspace.open(files.bad);
			const messages = await lint(editor);
			expect(messages.length).toBeGreaterThan(0);
		});

		it('produces expected message', async () => {
			const editor = await atom.workspace.open(files.bad);
			const [message] = await lint(editor);
			expect(message.location.file).toEqual(files.bad);
			expect(message.severity).toEqual('error');
			expect(message.excerpt).toEqual('Strings must use singlequote.');
			expect(message.url).toEqual('https://eslint.org/docs/rules/quotes');

			expect(message.location.position).toEqual([[1, 12], [1, 17]]);
			expect(message.solutions.length).toBe(1);
			expect(message.solutions[0].position).toEqual({start: {row: 1, column: 12}, end: {row: 1, column: 17}});
			expect(message.solutions[0].replaceWith).toBe('\'bar\'');
		});
	});

	describe('checks empty.js and', () => {
		it('finds no message', async () => {
			const editor = await atom.workspace.open(files.empty);
			const messages = await lint(editor);
			expect(messages.length).toBe(0);
		});
	});

	describe('checks good.js and', () => {
		it('finds no message', async () => {
			const editor = await atom.workspace.open(files.empty);
			const messages = await lint(editor);
			expect(messages.length).toBe(0);
		});
	});

	xdescribe('checks relative-path.js and', () => {
		it('shows no error notifications', async () => {
			const editor = await atom.workspace.open(files.relativePath);
			await lint(editor);
			const errorNotifications = atom.notifications.getNotifications().filter(notification => notification.getType() === 'error');
			expect(errorNotifications.length).toBe(0);
		});
	});

	describe('fixes fixable.js and', () => {
		it('produces text without errors', async () => {
			const expected = 'const foo = \'bar\';\n\nconsole.log(foo);\n\nconsole.log(foo);\n';
			const editor = await atom.workspace.open(files.fixable);
			const fixed = await fix(editor);
			const actual = fixed.getText();
			expect(actual).toBe(expected);

			const messages = await lint(fixed);
			expect(messages.length).toBe(0);
		});

		it('exclude default rules configured in rulesToDisableWhileFixingOnSave', async () => {
			atom.config.set('linter-xo.fixOnSave', true);
			const expected = '// uncapitalized comment\n';
			const editor = await atom.workspace.open(files.saveFixableDefault);
			editor.save();

			const actual = editor.getText();
			expect(actual).toBe(expected);

			const messages = await lint(editor);
			expect(messages.length).toBe(1);
		});

		it('exclude rules configured in rulesToDisableWhileFixingOnSave', async () => {
			atom.config.set('linter-xo.fixOnSave', true);
			atom.config.set('linter-xo.rulesToDisableWhileFixingOnSave', ['spaced-comment']);
			const expected = '//Uncapitalized comment\n';
			const editor = await atom.workspace.open(files.saveFixable);
			editor.save();

			const actual = editor.getText();
			expect(actual).toBe(expected);

			const messages = await lint(editor);
			expect(messages.length).toBe(1);
		});

		it('retains cursor position', async () => {
			const editor = await atom.workspace.open(files.fixable);
			editor.setCursorBufferPosition([5, 0]);
			const fixed = await fix(editor);
			const {row: actual} = fixed.getCursorBufferPosition();
			expect(actual).toBe(5);
		});
	});
});
