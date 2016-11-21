/** @babel */
import lint from './lint';

// (editor: Object) => function
export default function fix(editor, multipass = true) {
	// (text: string) => Promise<void>
	return text => {
		return lint(editor)(text, {fix: true})
			.then(report => {
				const [result] = report.results;
				const {messages} = result;

				if (result.output) {
					editor.setText(result.output);
					return;
				}

				const fixes = messages
					.map(message => message.fix)
					.filter(Boolean);

				fixes.reduce((remaining, fix) => {
					const buffer = editor.getBuffer();
					const [start, end] = fix.range;
					const range = fix.range.map(i => buffer.positionForCharacterIndex(i));
					buffer.setTextInRange(range, fix.text);
					const offset = fix.text.length - (end - start);

					return remaining.slice(1)
						.map(remain => {
							remain.range = remain.range.map(i => i + offset);
							return remain;
						});
				}, fixes);

				if (multipass) {
					return fix(editor, false)(editor.getText());
				}
			});
	};
}
