import test from 'ava';
import {paths} from '../fixtures';
import getXO from './get-xo';

test('in workspace with locally resolvable xo', async t => {
	const xo = await getXO(paths.local);
	t.is(xo.__test_name, 'local', 'it should return local resolable xo');
});

test('in workspace without locally resolvable xo', async t => {
	const xo = await getXO(paths.enabled);
	t.false('__test_name' in xo, 'it should return builtin xo');
});

test('in delegated workspace with locally resolvable xo', async t => {
	const xo = await getXO(paths['delegated/disabled']);
	t.is(xo.__test_name, 'delegated', 'it should return delegated locally resolveable xo');
});

test('in nested workspace with locally resolvable xo', async t => {
	const xo = await getXO(paths['delegated/enabled']);
	t.is(xo.__test_name, 'delegated/enabled', 'it should return nested locally resolveable xo');
});
