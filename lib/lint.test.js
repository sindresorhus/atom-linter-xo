import test from 'ava';
import {editors} from '../fixtures';
import lint from './lint';

test('lint: file without problems', async t => {
	const editor = editors.enabled(`console.log('No problems.');\n`);
	const {results: [{messages}]} = await lint(editor)(editor.getText());
	t.deepEqual(messages, [], 'it should report no errors');
});

test('lint: file with a problem', async t => {
	const editor = editors.enabled(`console.log('One problem');`);
	const {results: [{messages}]} = await lint(editor)(editor.getText());
	t.is(messages.length, 1, 'it should report one error if enabled');
});

test('lint: file with a problem in delegated workspace', async t => {
	const editor = editors.delegated(`console.log('One problem');`);
	const {results: [{messages}]} = await lint(editor)(editor.getText());
	t.is(messages.length, 1, 'it should report one error if delegated');
});

test('lint: file with a problem in disabled workspace', async t => {
	const editor = editors.disabled(`console.log('One problem');`);
	const {results: [{messages}]} = await lint(editor)(editor.getText());
	t.is(messages.length, 1, 'it should report no errors');
});
