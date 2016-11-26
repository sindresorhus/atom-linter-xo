import test from 'ava';
import {editors} from '../fixtures';
import fix from './fix';

test('lint: fix file without problems', async t => {
	const input = `console.log('No problems.');\n`;
	const editor = editors.enabled(input);
	await fix(editor)(editor.getText());
	const actual = editor.getText();
	t.is(actual, input, 'should leave input untouched');
});

test('lint: fix file with problems', async t => {
	const input = `console.log('Some problems.');;;`;
	const editor = editors.enabled(input);
	await fix(editor)(editor.getText());
	const actual = editor.getText();
	const expected = `console.log('Some problems.');\n`;
	t.is(actual, expected, 'should fix output');
});
