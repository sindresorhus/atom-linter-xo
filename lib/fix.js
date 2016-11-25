/** @babel */
import lint from './lint';

// (editor: Object) => function
export default function fix(editor) {
	// (text: string) => Promise<void>
	return text => {
		return lint(editor)(text, {fix: true})
			.then(report => {
				const [{output}] = report.results;
				const buffer = editor.getBuffer();

				if (output) {
					buffer.setTextViaDiff(output);
					return;
				}
			});
	};
}
