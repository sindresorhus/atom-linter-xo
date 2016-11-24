/** @babel */
import lint from './lint';

// (editor: Object) => function
export default function fix(editor) {
	// (text: string) => Promise<void>
	return text => {
		return lint(editor)(text, {fix: true})
			.then(report => {
				const [result] = report.results;

				if (result.output) {
					editor.setText(result.output);
					return;
				}
			});
	};
}
