import test from 'ava';
import proxyquire from 'proxyquire';
import {Range} from 'text-buffer';
import MockEditor from '../mocks/mock-editor';

const stubs = {
	atom: {
		Range,
		'@noCallThru': true,
		'@global': true
	}
};

const editor = new MockEditor({path: '__fake'});

const format = proxyquire('./format', stubs);

test('for an empty report', t => {
	const actual = format(editor)();
	const expected = [];
	t.deepEqual(actual, expected, 'it should return an empty array');
});

test('for a report without results', t => {
	const actual = format(editor)({});
	const expected = [];
	t.deepEqual(actual, expected, 'it should return an empty array');
});

test('for a report with empty results', t => {
	const actual = format(editor)({results: []});
	const expected = [];
	t.deepEqual(actual, expected, 'it should return an empty array');
});

test('for a report with an error message', t => {
	const input = {
		results: [
			{
				messages: [
					{
						message: 'message',
						severity: 2
					}
				]
			}
		]
	};

	const [actual] = format(editor)(input);
	t.is(actual.severity, 'error', 'it should return an Error');
	t.is(actual.excerpt, 'message', 'it should return appropriate excerpt');
});

test('for a report with an error message with a location', t => {
	const input = {
		results: [
			{
				messages: [
					{
						message: 'message',
						severity: 2,
						line: 1,
						column: 1,
						endLine: 1,
						endColumn: 2
					}
				]
			}
		]
	};

	const [{location: actual}] = format(editor)(input);
	const expected = {
		file: '__fake',
		position: [[0, 0], [0, 1]]
	};
	t.deepEqual(actual, expected, 'it should return the correct location');
});

test('for a report with fixes', t => {
	const input = {
		results: [
			{
				messages: [
					{
						fix: {
							range: [0, 0],
							text: ';'
						}
					}
				]
			}
		]
	};

	const [{solutions: [actual]}] = format(editor)(input);
	const expected = {
		position: {
			end: {column: 0, row: 0},
			start: {column: 0, row: 0}
		},
		replaceWith: ';'
	};
	t.like(actual, expected, 'it should return the correct location');
});
