/** @babel */
import path from 'path';
import {fork} from 'child_process';
import uuid from 'uuid';

export default function lint(payload) {
	return new Promise((resolve, reject) => {
		const worker = getWorker();
		const id = uuid.v4();

		const onMessage = message => {
			if (message.error) {
				reject(Object.assign(new Error(), message.error));
				worker.removeListener('message', onMessage);
				return;
			}

			if (message.id !== id) {
				return;
			}

			resolve(message.payload);
			worker.removeListener('message', onMessage);
		};

		worker.on('message', onMessage);
		worker.on('error', reject);
		worker.send({id, payload});
	});
}

// Start a worker eagerly
let runningWorker = getWorker();

function getWorker() {
	if (runningWorker) {
		return runningWorker;
	}

	const workerPath = path.resolve(__dirname, './worker.js');
	const worker = fork(workerPath, [], {silent: true});

	worker.stdout.on('data', data => console.log(data.toString()));
	worker.stderr.on('data', data => console.error(data.toString()));

	worker.on('close', () => {
		runningWorker = null;
	});

	return worker;
}
