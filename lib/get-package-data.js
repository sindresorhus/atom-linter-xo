/** @babel */
import loadJsonFile from 'load-json-file';
import getPackagePath from './get-package-path';

// (base: string) => pkg: Promise<Object>
export default async function getPackageData(base) {
	const packagePath = await getPackagePath(base);
	return packagePath ? loadJsonFile(packagePath) : {};
}
