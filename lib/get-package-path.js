const path = require('path');
const loadJsonFile = require('load-json-file');
const pkgDir = require('pkg-dir');

const DEFAULT_PACKAGE = {xo: false};

// (base: string) => pkgPath: Promise<string>
async function findPackage(base) {
	const pkgPath = path.join(base, 'package.json');
	const pkg = await loadPkg(pkgPath);

	if (pkg.xo === false && base !== null) {
		return findPackage(path.join(base, '..'));
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
	const resolvedBase = await pkgDir(base);
	return resolvedBase ? findPackage(resolvedBase) : null;
}

module.exports = getPackagePath;
