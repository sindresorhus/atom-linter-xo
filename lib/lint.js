const path = require('path');
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

async function getCWD(base) {
	const pkgPath = await getPackagePath(base);
	return pkgPath ? path.dirname(pkgPath) : base;
}

// (base: string) => depends: Promise<Boolean>
async function dependsOnXO(base) {
	const {dependencies = {}, devDependencies = {}} = await getPackageData(base);
	return 'xo' in dependencies || 'xo' in devDependencies;
}

// (filename: string) => function
function lint(filename) {
	if (!filename) {
		return async () => EMPTY_REPORT;
	}

	const fileDirectory = path.dirname(filename);

	const pendingContext = Promise.all([
		getCWD(fileDirectory),
		dependsOnXO(fileDirectory),
		getXO(fileDirectory)
	]);

	// (editorText: string, options?: Object) => Promise<Object>
	return async (editorText, options) => {
		const [cwd, depends, xo] = await pendingContext;

		if (!depends) {
			return EMPTY_REPORT;
		}

		// Ugly hack to workaround ESLint's lack of a `cwd` option
		// TODO: remove this when https://github.com/sindresorhus/atom-linter-xo/issues/19 is resolved
		const previous = process.cwd();
		process.chdir(cwd);

		const report = xo.lintText(editorText, {
			cwd: fileDirectory,
			...(filename ? {filename, cwd} : {}),
			...options
		});

		process.chdir(previous);
		return report;
	};
}

module.exports = lint;
