'use babel';
import {allowUnsafeNewFunction} from 'loophole';

var lintText;
allowUnsafeNewFunction(() => {
	lintText = require('xo').lintText;
});

function lint(textEditor) {
	var report;

	allowUnsafeNewFunction(() => {
		report = lintText(textEditor.getText());
	});

	var filePath = textEditor.getPath();
	var ret = [];

	report.results.forEach(function (result) {
		result.messages.forEach(function (x) {
			ret.push({
				type: x.severity === 2 ? 'Error' : 'Warning',
				text: x.message + ' (' + x.ruleId + ')',
				filePath: filePath,
				range: [
					[x.line - 1, x.column - 1],
					[x.line - 1, x.column - 1]
				]
			});
		});
	});

	return ret;
}

export let provideLinter = () => {
	return {
		grammarScopes: [
			'source.js',
			'source.jsx',
			'source.js.jsx'
		],
		scope: 'file',
		lintOnFly: true,
		lint: lint
	};
};
