/** @babel */
import lint from './lint';

// (editor: Object) => function
export default function fix(editor) {
	// (text: string) => Promise<void>
	return (text, exclude) => {
		const fix = exclude ? report => !exclude.includes(report.ruleId) : true;
		return lint(editor)(text, {fix})
			.then(report => {
				const [result] = report.results;

				// No results are returned when the file is ignored
				if (result && result.output) {
					editor.getBuffer().setTextViaDiff(result.output);
				}
			});
	};
}
