import test from 'ava';
import {paths} from '../fixtures';
import getPackageData from './get-package-data';

test('get-package-data: in enabled workspace', async t => {
	const {name: actual} = await getPackageData(paths.enabled);
	t.is(actual, 'enabled', 'it should return path to manifest in enabled workspace');
});

test('get-package-data: in disabled workspace', async t => {
	const {name: actual} = await getPackageData(paths.disabled);
	t.is(actual, 'disabled', 'it should return path to manifest in disabled workspace');
});

test('get-package-data: in delegated workspace', async t => {
	const {name: actual} = await getPackageData(paths['delegated/disabled']);
	t.is(actual, 'delegated', 'it should return path to manifest in disabled workspace');
});

test('get-package-data: in nested workspace', async t => {
	const {name: actual} = await getPackageData(paths['delegated/enabled']);
	t.is(actual, 'delegated/enabled', 'it should return path to manifest in disabled workspace');
});
