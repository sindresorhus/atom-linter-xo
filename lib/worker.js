const {CompositeDisposable, Task} = require('atom');
const pLimit = require('p-limit');
const uniqueString = require('unique-string');

const limit = pLimit(1);
let worker;

module.exports.startWorker = startWorker;
module.exports.stopWorker = stopWorker;

function startWorker(createWorker) {
	if (worker) {
		if (worker.childProcess.connected) {
			return;
		}

		stopWorker();
	}

	worker = createWorker ? createWorker() : new Task(require.resolve('./xo-helper.js'));

	worker.start([]);
}

function stopWorker() {
	if (worker) {
		worker.terminate();
		worker = undefined;
	}
}

async function sendJob(config) {
	config.id = uniqueString();
	const subscriptions = new CompositeDisposable();

	const job = new Promise((resolve, reject) => {
		subscriptions.add(worker.on(`error:${config.id}`, ({message, stack}) => {
			const error = new Error(message);
			error.stack = stack;
			reject(error);
		}));

		subscriptions.add(worker.on(config.id, data => {
			resolve(data);
		}));

		worker.send(config);
	});

	try {
		return await job;
	} catch (error) {
		console.error(error);
		atom.notifications.addError(
			'linter-xo:: Error while running XO!',
			{
				detail: error.message,
				dismissable: true
			}
		);
	} finally {
		subscriptions.dispose();
	}
}

module.exports.lint = function (filename) {
	startWorker();

	return (editorText, options) => limit(() => sendJob({type: 'lint', editorText, filename, options}));
};
