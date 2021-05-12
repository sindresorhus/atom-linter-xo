function disableRules(ids = []) {
	const rules = {};
	for (const id of ids) {
		rules[id] = 0;
	}

	return rules;
}

// (editor: Object) => function
function fix(editor, lint) {
	// (text: string) => Promise<void>
	return async (text, exclude) => {
		const rules = disableRules(exclude);
		const report = await lint(editor.getPath())(text, {fix: true, rules});
		const [result] = report.results;

		// No results are returned when the file is ignored
		if (result && result.output) {
			editor.getBuffer().setTextViaDiff(result.output);
		}
	};
}

module.exports = fix;
