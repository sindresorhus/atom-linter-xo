/** @babel */
import path from 'path';
import loadJsonFile from 'load-json-file';
import pkgDir from 'pkg-dir';
import props from 'p-props';

const DEFAULT_PKG = {xo: false};

// (base: string) => pkgPath: Promise<string>
export default function getPackagePath(base) {
	return pkgDir(base)
		.then(base => base ? findPkg(base) : null);
}

// (base: string) => pkgPath: Promise<string>
function findPkg(base) {
	return Promise.resolve()
		.then(() => path.join(base, 'package.json'))
		.then(pkgPath => props({pkgPath, pkg: loadPkg(pkgPath)}))
		.then(result => {
			if (result.pkg.xo === false && base !== null) {
				return findPkg(path.join(base, '..'));
			}
			return result.pkgPath;
		});
}

// (file: string) => pkg: Promise<Object>
function loadPkg(file) {
	return loadJsonFile(file)
		.catch(() => DEFAULT_PKG);
}
