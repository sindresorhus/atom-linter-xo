import path from 'path';
import test from 'ava';
import {paths} from '../mocks';
import getPackageData from './get-package-data';

test('in enabled workspace', async t => {
	const {name: actual} = await getPackageData(paths.enabled);
	t.is(actual, 'enabled', 'it should return manifest in enabled workspace');
});

test('in delegated workspace', async t => {
	const {name: actual} = await getPackageData(paths['delegated/disabled']);
	t.is(actual, 'delegated', 'it should return manifest in disabled workspace');
});

test('in disabled workspace', async t => {
	const actual = await getPackageData(path.dirname(paths.disabled));
	t.deepEqual(actual, {}, 'it should return manifest in disabled workspace');
});

test('in nested workspace', async t => {
	const {name: actual} = await getPackageData(paths['delegated/enabled']);
	t.is(actual, 'delegated/enabled', 'it should return manifest in disabled workspace');
});
