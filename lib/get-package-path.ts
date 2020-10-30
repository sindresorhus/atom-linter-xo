/** @babel */
import type {JsonObject} from 'type-fest';
import path from 'path';
import loadJsonFile from 'load-json-file';
import pkgDir from 'pkg-dir';

const DEFAULT_PACKAGE = {xo: false};

async function findPackage(base: string): Promise<string> {
	const pkgPath = path.join(base, 'package.json');
	const pkg = await loadPkg(pkgPath);

	if (pkg.xo === false && base !== null) {
		return findPackage(path.join(base, '..'));
	}

	return pkgPath;
}

async function loadPkg(file: string): Promise<JsonObject> {
	try {
		return await loadJsonFile(file);
	} catch {
		return DEFAULT_PACKAGE;
	}
}

export default async function getPackagePath(base: string): Promise<string | null> {
	const resolvedBase = await pkgDir(base);
	return resolvedBase ? findPackage(resolvedBase) : null;
}
