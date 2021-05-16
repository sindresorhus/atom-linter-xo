const test = require('ava');
const pMapSeries = require('p-map-series');
const proxyquire = require('proxyquire');
const {CompositeDisposable} = require('event-kit');
const {processMessages, MockTask} = require('../mocks/mock-task.js');

const stubs = {
	atom: {
		CompositeDisposable,
		'@noCallThru': true,
		'@global': true
	}
};

const {startWorker, stopWorker, lint} = proxyquire('./worker.js', stubs);

test.afterEach(() => {
	stopWorker();
});

test.serial('starting the worker starts a child process', t => {
	const task = new MockTask();
	startWorker(() => task);

	t.true(task.childProcess.connected);
});

test.serial('stopping the worker terminates the child process', t => {
	const task = new MockTask();
	startWorker(() => task);
	stopWorker();

	t.false(task.childProcess.connected);
});

test.serial('lint sends a job to the child process', async t => {
	const task = new MockTask();
	startWorker(() => task);
	const lintJob = lint('foo.js')('// some editor text');

	processMessages(task);

	const result = await lintJob;

	t.deepEqual(result, {
		editorText: '// some editor text',
		filename: 'foo.js',
		options: undefined,
		type: 'lint'
	});
});

test.serial('lint can send multiple concurrent jobs to the child process', async t => {
	console.log('concurrent test');
	const task = new MockTask();
	startWorker(() => task);

	const lintJobs = pMapSeries([
		lint('foo.js')('// some editor text'),
		lint('bar.js')('// some more editor text'),
		lint('baz.js')('// some other editor text')
	], job => {
		processMessages(task);
		return job;
	});

	processMessages(task);

	const [fooResult, barResult, bazResult] = await lintJobs;

	t.deepEqual(fooResult, {
		editorText: '// some editor text',
		filename: 'foo.js',
		options: undefined,
		type: 'lint'
	});

	t.deepEqual(barResult, {
		editorText: '// some more editor text',
		filename: 'bar.js',
		options: undefined,
		type: 'lint'
	});

	t.deepEqual(bazResult, {
		editorText: '// some other editor text',
		filename: 'baz.js',
		options: undefined,
		type: 'lint'
	});
});
