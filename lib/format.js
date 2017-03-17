/** @babel */
import {Range} from 'atom';
import {rangeFromLineNumber} from 'atom-linter';
import ruleURI from 'eslint-rule-documentation';

// (editor: Object) => function
export default function format(editor) {
	const buffer = editor.getBuffer();
	const filePath = editor.getPath();

	// (report?: Object) => Array<Object>
	return report => {
		if (!report) {
			return [];
		}

		const {results = []} = report;
		const [result] = results;

		if (!result) {
			return [];
		}

		const {messages} = result;

		if (!messages) {
			return [];
		}

		return messages.map(message => {
			return {
				filePath,
				fix: selectMessageFix(message, buffer),
				html: selectMessageHtml(message),
				range: selectMessageRange(editor, message),
				type: selectMessageType(message)
			};
		});
	};
}

// (message: Object, buffer: Object) => Array<Object>
function selectMessageFix(message, buffer) {
	const fix = {message};

	if (!fix) {
		return null;
	}

	const {
		range: rawRange = [],
		text: newText
	} = fix;

	const points = rawRange.map(index => buffer.positionForCharacterIndex(index));
	const range = new Range(...points);
	return {newText, range};
}

// (message: Object, err: Error) => string
function selectMessageHtml(result) {
	const {message, ruleId} = result;
	const {url} = ruleURI(ruleId || '');

	const link = ruleId ? `(<a href=${url}>${ruleId}</a>)` : '';
	return `<span>${[message, link].filter(Boolean).join(' ')}</span>`;
}

// (editor: Object, message: Object) => Array<number>
function selectMessageRange(editor, x) {
	const msgLine = x.line - 1;

	if (typeof x.endColumn === 'number' && typeof x.endLine === 'number') {
		const msgCol = Math.max(0, x.column - 1);
		return [[msgLine, msgCol], [x.endLine - 1, x.endColumn - 1]];
	} else if (typeof x.line === 'number' && typeof x.column === 'number') {
		// we want msgCol to remain undefined if it was intentional so
		// `rangeFromLineNumber` will give us a range over the entire line
		const msgCol = typeof x.column === 'undefined' ? x.column : x.column - 1;

		try {
			return rangeFromLineNumber(editor, msgLine, msgCol);
		} catch (err) {
			throw new Error(`Failed getting range. This is most likely an issue with ESLint. (${x.ruleId} - ${x.message} at ${x.line}:${x.column})`);
		}
	}
}

// (message: Object) => string
function selectMessageType(message) {
	return message.severity === 2 ? 'Error' : 'Warning';
}
