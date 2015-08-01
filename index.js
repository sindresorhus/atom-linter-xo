'use babel';
import {allowUnsafeNewFunction} from 'loophole';

let lintText;
allowUnsafeNewFunction(() => {
	lintText = require('xo').lintText;
});

function lint(textEditor) {
	let report;

	allowUnsafeNewFunction(() => {
		report = lintText(textEditor.getText());
	});

	const filePath = textEditor.getPath();
	const ret = [];

	report.results.forEach(function (result) {
		result.messages.forEach(function (x) {
			ret.push({
				filePath,
				type: x.severity === 2 ? 'Error' : 'Warning',
				text: x.message + ' (' + x.ruleId + ')',
				range: [
					[x.line - 1, x.column - 1],
					[x.line - 1, x.column - 1]
				]
			});
		});
	});

	return ret;
}

export const provideLinter = () => {
	return {
		grammarScopes: [
			'source.js',
			'source.jsx',
			'source.js.jsx'
		],
		scope: 'file',
		lintOnFly: true,
		lint
	};
};
