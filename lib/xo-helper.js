/* global emit */
const lint = require('./lint.js');

process.title = 'linter-xo helper';

module.exports = function () {
	process.on('message', async config => {
		const {id, editorText, filename, options} = config;

		try {
			const report = await lint(filename)(editorText, options);

			emit(id, report);
		} catch (error) {
			emit(`error:${id}`, {message: error.message, stack: error.stack});
		}
	});
};
