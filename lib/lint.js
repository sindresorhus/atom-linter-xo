/** @babel */
import path from 'path';
import {allowUnsafeNewFunction} from 'loophole';
import pProps from 'p-props';
import getPackageData from './get-package-data';
import getPackagePath from './get-package-path';
import getXO from './get-xo';

const EMPTY_REPORT = {results: [{messages: []}]};

// (editor: Object) => function
export default function lint(editor) {
	const filename = editor.getPath();

	if (!filename) {
		return () => Promise.resolve(EMPTY_REPORT);
	}

	const cwd = path.dirname(filename);

	const pendingContext = pProps({
		cwd: getPackagePath(cwd).then(pkgPath => pkgPath ? path.dirname(pkgPath) : cwd),
		depends: dependsOnXO(cwd),
		xo: getXO(cwd)
	});

	// (source: string, options?: Object) => Promise<Object>
	return (source, options) => {
		return pendingContext
			.then(({cwd, depends, xo}) => {
				if (!depends) {
					return EMPTY_REPORT;
				}

				// ugly hack to workaround ESLint's lack of a `cwd` option
				// TODO: remove this when https://github.com/sindresorhus/atom-linter-xo/issues/19 is resolved
				const previous = process.cwd();
				process.chdir(cwd);

				let report = EMPTY_REPORT;

				allowUnsafeNewFunction(() => {
					const opts = Object.assign(
						{cwd: path.dirname(editor.getPath())},
						filename ? {filename, cwd} : {},
						options
					);
					report = xo.lintText(source, opts);
				});

				process.chdir(previous);
				return report;
			});
	};
}

// (base: string) => depends: Promise<Boolean>
function dependsOnXO(base) {
	return getPackageData(base)
		.then(pkg => {
			const {dependencies = {}, devDependencies = {}} = pkg;
			return 'xo' in dependencies || 'xo' in devDependencies;
		});
}
