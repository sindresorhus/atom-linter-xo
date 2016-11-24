/** @babel */
import path from 'path';
import loadJsonFile from 'load-json-file';
import pkgDir from 'pkg-dir';

const DEFAULT_PKG = {xo: false};

// (base: string) => pkgPath: Promise<string>
export default function getPackagePath(base) {
	return pkgDir(base).then(findPkg);
}

// (base: string) => pkgPath: Promise<string>
function findPkg(base) {
	const pkgPath = path.join(base, 'package.json');

	return loadPkg(pkgPath)
		.then(pkg => {
			if (pkg.xo === false && base !== null) {
				return findPkg(path.join(base, '..'));
			}
			return pkgPath;
		});
}

// (file: string) => pkg: Promise<Object>
function loadPkg(file) {
	return loadJsonFile(file)
		.catch(() => DEFAULT_PKG);
}
