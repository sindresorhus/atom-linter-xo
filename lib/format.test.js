import test from 'ava';
import proxyquire from 'proxyquire';
import {Range} from 'text-buffer';
import MockEditor from '../fixtures/mock-editor';

const stubs = {
	atom: {
		Range,
		'@noCallThru': true,
		'@global': true
	}
};

const editor = new MockEditor({path: '__fake'});

const format = proxyquire('./format', stubs).default;

test('for an empty report', t => {
	const actual = format(editor)();
	const expected = [];
	t.deepEqual(actual, expected, 'it should return an empty array');
});

test('for a report with an error message', t => {
	const input = {
		results: [{
			messages: [
				{
					message: 'message',
					severity: 2
				}
			]
		}]
	};

	const [actual] = format(editor)(input);
	t.is(actual.type, 'Error', 'it should return an Error');
	t.is(actual.html, '<span>message</span>', 'it should return appropriate html');
});
