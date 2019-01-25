/** @babel */
import {allowUnsafeNewFunction} from 'loophole';
import resolveFrom from 'resolve-from';
import getPackagePath from './get-package-path';

// (id: string) => any
function dangerouslyRequire(id) {
	let mod;

	allowUnsafeNewFunction(() => {
		mod = require(id);
	});

	return mod;
}

// (base: string, id: string) => resolved: string
function degradingResolve(base, id) {
	return base ?
		resolveFrom.silent(base, id) || require.resolve(id) :
		require.resolve(id);
}

// (base: string) => xo: Promise<Object>
export default async function getXO(base) {
	const resolvedBase = base ? await getPackagePath(base) : __dirname;
	const resolvedPath = degradingResolve(resolvedBase, 'xo');
	return dangerouslyRequire(resolvedPath);
}
