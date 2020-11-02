const loadJsonFile = require('load-json-file');
const getPackagePath = require('./get-package-path');

// (base: string) => pkg: Promise<Object>
async function getPackageData(base) {
	const packagePath = await getPackagePath(base);
	return packagePath ? loadJsonFile(packagePath) : {};
}

module.exports = getPackageData;
