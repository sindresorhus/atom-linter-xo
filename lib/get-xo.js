const resolveFrom = require('resolve-from');
const getPackagePath = require('./get-package-path');

// (base: string, id: string) => resolved: string
function degradingResolve(base, id) {
	return base ?
		resolveFrom.silent(base, id) || require.resolve(id) :
		require.resolve(id);
}

// (base: string) => xo: Promise<Object>
async function getXO(base) {
	const resolvedBase = base ? await getPackagePath(base) : __dirname;
	const resolvedPath = degradingResolve(resolvedBase, 'xo');
	return require(resolvedPath);
}

module.exports = getXO;
