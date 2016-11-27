/** @babel */
import loadJsonFile from 'load-json-file';
import getPackagePath from './get-package-path';

// (base: string) => pkg: Promise<Object>
export default function getPackageData(base) {
	return getPackagePath(base)
		.then(pkgPath => pkgPath ? loadJsonFile(pkgPath) : {});
}
