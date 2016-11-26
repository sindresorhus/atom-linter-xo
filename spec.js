/** @babel */
/* eslint-env atom, jasmine */
/* global waitsForPromise */
import {files} from './fixtures';
import {provideLinter} from '.';

describe('xo provider for linter', () => {
	const {lint} = provideLinter();
	const cmd = (editor, name) => atom.commands.dispatch(atom.views.getView(editor), name);
	const fix = editor => {
		return Promise.resolve()
			.then(() => {
				cmd(editor, 'XO:Fix');
				return new Promise(resolve => {
					editor.onDidChange(() => {
						resolve(editor);
					});
				});
			});
	};

	beforeEach(() => {
		waitsForPromise(async () => {
			await atom.packages.activatePackage('language-javascript');
			await atom.packages.activatePackage('linter-xo');
		});
	});

	describe('checks bad.js and', () => {
		it('finds at least one message', () => {
			waitsForPromise(async () => {
				const editor = await atom.workspace.open(files.bad);
				const messages = await lint(editor);
				expect(messages.length).toBeGreaterThan(0);
			});
		});

		it('produces expected message', () => {
			waitsForPromise(async () => {
				const editor = await atom.workspace.open(files.bad);
				const [message] = await lint(editor);
				expect(message.filePath).toEqual(files.bad);
				expect(message.type).toEqual('Error');
				expect(message.html).toEqual('<span>Strings must use singlequote. (<a href=http://eslint.org/docs/rules/quotes>quotes</a>)</span>');
			});
		});
	});

	describe('checks empty.js and', () => {
		it('finds no message', () => {
			waitsForPromise(async () => {
				const editor = await atom.workspace.open(files.empty);
				const messages = await lint(editor);
				expect(messages.length).toBe(0);
			});
		});
	});

	describe('checks good.js and', () => {
		it('finds no message', () => {
			waitsForPromise(async () => {
				const editor = await atom.workspace.open(files.empty);
				const messages = await lint(editor);
				expect(messages.length).toBe(0);
			});
		});
	});

	describe('fixes fixable.js and', () => {
		it('produces text without errors', () => {
			waitsForPromise(async () => {
				const expected = `const foo = 'bar';\n\nconsole.log(foo);\n\nconsole.log(foo);\n`;
				const editor = await atom.workspace.open(files.fixable);
				const fixed = await fix(editor);
				const actual = fixed.getText();
				expect(actual).toBe(expected);

				const messages = await lint(fixed);
				expect(messages.length).toBe(0);
			});
		});

		it('retains cursor position', () => {
			waitsForPromise(async () => {
				const editor = await atom.workspace.open(files.fixable);
				editor.setCursorBufferPosition([5, 0]);
				const fixed = await fix(editor);
				const {row: actual} = fixed.getCursorBufferPosition();
				expect(actual).toBe(5);
			});
		});
	});
});
