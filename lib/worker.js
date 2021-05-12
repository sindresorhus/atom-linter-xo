const {Task} = require('atom');
const {default: PQueue} = require('p-queue');
const uniqueString = require('unique-string');

const queue = new PQueue({concurrency: 1});
let worker = null;

module.exports.startWorker = startWorker;
module.exports.stopWorker = stopWorker;

function startWorker() {
	if (worker) {
		if (worker.childProcess.connected) {
			return;
		}

		stopWorker();
	}

	worker = new Task(require.resolve('./xo-helper.js'));

	worker.start([]);
}

function stopWorker() {
	if (worker) {
		worker.terminate();
		worker = null;
	}
}

function sendJob(config) {
	config.id = uniqueString();

	let errorDisposable;
	let responseDisposable;

	return new Promise((resolve, reject) => {
		errorDisposable = worker.on(`error:${config.id}`, ({message, stack}) => {
			const error = new Error(message);
			error.stack = stack;
			reject(error);
		});
		responseDisposable = worker.on(config.id, data => {
			resolve(data);
		});

		worker.send(config);
	}).catch(error => {
		console.error(error);
		atom.notifications.addError(
			'linter-xo:: Error while running XO!',
			{
				detail: error.message,
				dismissable: true
			}
		);
	}).finally(() => {
		errorDisposable?.dispose();
		responseDisposable?.dispose();
	});
}

module.exports.lint = function (filename) {
	startWorker();

	return (editorText, options) => queue.add(() => sendJob({type: 'lint', editorText, filename, options}));
};
