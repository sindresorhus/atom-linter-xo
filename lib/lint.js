const path = require('path');
const pProps = require('p-props');
const getPackageData = require('./get-package-data');
const getPackagePath = require('./get-package-path');
const getXO = require('./get-xo');

const EMPTY_REPORT = {
	results: [
		{
			messages: []
		}
	]
};

// (base: string) => depends: Promise<Boolean>
async function dependsOnXO(base) {
	const {dependencies = {}, devDependencies = {}} = await getPackageData(base);
	return 'xo' in dependencies || 'xo' in devDependencies;
}

// (editor: Object) => function
function lint(editor) {
	const filename = editor.getPath();

	if (!filename) {
		return async () => EMPTY_REPORT;
	}

	const cwd = path.dirname(filename);

	const pendingContext = pProps({
		cwd: (async () => {
			const pkgPath = await getPackagePath(cwd);
			return pkgPath ? path.dirname(pkgPath) : cwd;
		})(),
		depends: dependsOnXO(cwd),
		xo: getXO(cwd)
	});

	// (source: string, options?: Object) => Promise<Object>
	return async (source, options) => {
		const {cwd, depends, xo} = await pendingContext;

		if (!depends) {
			return EMPTY_REPORT;
		}

		// Ugly hack to workaround ESLint's lack of a `cwd` option
		// TODO: remove this when https://github.com/sindresorhus/atom-linter-xo/issues/19 is resolved
		const previous = process.cwd();
		process.chdir(cwd);

		let report = EMPTY_REPORT;
		try {
			report = xo.lintText(source, {
				cwd: path.dirname(editor.getPath()),
				...(filename ? {filename, cwd} : {}),
				...options
			});
		} catch (error) {
			console.error(error);
			atom.notifications.addError(
				'linter-xo:: Error while running XO!',
				{
					detail: error.message,
					dismissable: true
				}
			);
		}

		process.chdir(previous);
		return report;
	};
}

module.exports = lint;
