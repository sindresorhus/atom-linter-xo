// (editor: Object) => function
function fix(editor, lint) {
	// (text: string) => Promise<void>
	return async (text, exclude) => {
		const fix = exclude ? report => !exclude.includes(report.ruleId) : true;
		const report = await lint(editor.getPath())(text, {fix});
		const [result] = report.results;

		// No results are returned when the file is ignored
		if (result && result.output) {
			editor.getBuffer().setTextViaDiff(result.output);
		}
	};
}

module.exports = fix;
