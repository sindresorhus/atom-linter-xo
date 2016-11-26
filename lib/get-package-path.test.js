import path from 'path';
import test from 'ava';
import {paths} from '../fixtures';
import getPackagePath from './get-package-path';

test('get-package-path: in enabled workspace', async t => {
	const actual = await getPackagePath(paths.enabled);
	const expected = path.resolve(paths.enabled, 'package.json');
	t.is(actual, expected, 'it should return path to manifest in enabled workspace');
});

test('get-package-path: in disabled workspace', async t => {
	const actual = await getPackagePath(paths.disabled);
	const expected = path.resolve(paths.disabled, 'package.json');
	t.is(actual, expected, 'it should return path to manifest in disabled workspace');
});

test('get-package-path: in delegated workspace', async t => {
	const actual = await getPackagePath(paths['delegated/disabled']);
	const expected = path.resolve(paths.delegated, 'package.json');
	t.is(actual, expected, 'it should return path to manifest in delegated workspace');
});

test('get-package-path: in nested workspace', async t => {
	const actual = await getPackagePath(paths['delegated/enabled']);
	const expected = path.resolve(paths['delegated/enabled'], 'package.json');
	t.is(actual, expected, 'it should return path to manifest in nested workspace');
});
