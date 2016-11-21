/** @babel */
import {Range} from 'atom';
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
				range: selectMessageRange(message),
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

// (message: Object) => string
function selectMessageHtml(result) {
	const {message, ruleId} = result;

	if (!ruleId) {
		return `<span>${message}</span>`;
	}

	const {url} = ruleURI(ruleId);
	return `<span>${message} (<a href=${url}>${ruleId}</a>)</span>`;
}

function selectMessageRange(message) {
	const {line, column} = message;
	const endLine = typeof message.endLine === 'number' ? message.endLine : line;
	const endColumn = typeof message.endColumn === 'number' ?
		message.endColumn : column;

	const startCursor = [line, column]
		.filter(coord => typeof coord === 'number')
		.map(coord => coord - 1);

	const endCursor = [endLine, endColumn]
		.filter(coord => typeof coord === 'number')
		.map(coord => coord - 1);

	return [startCursor, endCursor];
}

function selectMessageType(message) {
	return message.severity === 2 ? 'Error' : 'Warning';
}
