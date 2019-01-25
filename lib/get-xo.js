/** @babel */
import resolveFrom from 'resolve-from';
import getPackagePath from './get-package-path';

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
	return require(resolvedPath);
}
