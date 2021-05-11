import path from 'path';
import test from 'ava';
import {paths} from '../mocks.js';
import getPackagePath from './get-package-path.js';

test('in enabled workspace', async t => {
	const actual = await getPackagePath(paths.enabled);
	const expected = path.resolve(paths.enabled, 'package.json');
	t.is(actual, expected, 'it should return path to manifest in enabled workspace');
});

test('in disabled workspace', async t => {
	const actual = await getPackagePath(paths.disabled);
	t.is(actual, null, 'it should return path to manifest in disabled workspace');
});

test('in delegated workspace', async t => {
	const actual = await getPackagePath(paths['delegated/disabled']);
	const expected = path.resolve(paths.delegated, 'package.json');
	t.is(actual, expected, 'it should return path to manifest in delegated workspace');
});

test('in nested workspace', async t => {
	const actual = await getPackagePath(paths['delegated/enabled']);
	const expected = path.resolve(paths['delegated/enabled'], 'package.json');
	t.is(actual, expected, 'it should return path to manifest in nested workspace');
});

test('in no workspace', async t => {
	const actual = await getPackagePath('/');
	t.is(actual, null, 'it should return null');
});
