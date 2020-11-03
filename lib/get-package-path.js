const path = require('path');
const loadJsonFile = require('load-json-file');
const pkgUp = require('pkg-up');

const DEFAULT_PACKAGE = {xo: false};

// (base: string) => pkgPath: Promise<string>
async function findPackage(base) {
	const pkgPath = await pkgUp({cwd: base});
	const pkg = await loadPkg(pkgPath);

	if (pkg.xo === false && pkgPath !== null) {
		const newBase = path.resolve(path.dirname(pkgPath), '..');
		return getPackagePath(newBase);
	}

	return pkgPath;
}

// (file: string) => pkg: Promise<Object>
async function loadPkg(file) {
	try {
		return await loadJsonFile(file);
	} catch {
		return DEFAULT_PACKAGE;
	}
}

// (base: string) => pkgPath: Promise<string>
async function getPackagePath(base) {
	return findPackage(base);
}

module.exports = getPackagePath;
