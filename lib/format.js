/** @babel */
import {Range} from 'atom';
import {rangeFromLineNumber} from 'atom-linter';
import ruleURI from 'eslint-rule-documentation';

// (editor: Object) => function
export default function format(editor) {
	const buffer = editor.getBuffer();
	const filePath = editor.getPath();

	// (report: Object) => Array<Object>
	return report => {
		if (!report) {
			return [];
		}

		const [{messages}] = report.results;

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
function selectMessageRange(editor, message) {
	const {line, column} = message;
	const endLine = typeof message.endLine === 'number' ? message.endLine : line;
	const endColumn = typeof message.endColumn === 'number' ?
		message.endColumn : column;

	const start = [line, column]
		.filter(coord => typeof coord === 'number')
		.map(coord => coord - 1);

	const end = [endLine, endColumn]
		.filter(coord => typeof coord === 'number')
		.map(coord => coord - 1);

	if (end.length === 2) {
		return [start, end];
	}

	try {
		return rangeFromLineNumber(editor, start[0], start[1]);
	} catch (err) {
		throw new Error(`Failed getting range for "${message.message} (${message.ruleId})" at ${start.join(':')}. This is most likely an issue with ESLint.`);
	}
}

// (message: Object) => string
function selectMessageType(message) {
	return message.severity === 2 ? 'Error' : 'Warning';
}
