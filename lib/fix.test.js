const test = require('ava');
const {editors} = require('../mocks/index.js');
const fix = require('./fix.js');
const lint = require('./lint.js');

test('fix file without problems', async t => {
	const input = 'console.log(\'No problems.\');\n';
	const editor = editors.enabled(input);
	await fix(editor, lint)(editor.getText());
	const actual = editor.getText();
	t.is(actual, input, 'should leave input untouched');
});

test('fix file with problems', async t => {
	const input = 'console.log(\'Some problems.\');;;';
	const editor = editors.enabled(input);
	await fix(editor, lint)(editor.getText());
	const actual = editor.getText();
	const expected = 'console.log(\'Some problems.\');\n';
	t.is(actual, expected, 'should fix output');
});

test('exclude rules from fixing', async t => {
	const input = '//some uncapitalized comment';
	const editor = editors.enabled(input);
	await fix(editor, lint)(editor.getText(), ['capitalized-comments']);
	const actual = editor.getText();
	const expected = '// some uncapitalized comment\n';
	t.is(actual, expected, 'should fix output, but not capitalized the comment');
});
