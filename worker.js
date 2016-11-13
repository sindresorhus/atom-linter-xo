const proxyquire = require('proxyquire');
const resolve = require('resolve');
const serializeError = require('serialize-error');

process.on('message', message => {
	const {payload: {text, opts}} = message;
	const {cwd, filename, config} = opts;

	const xo = requireXO(cwd, config);
	const report = xo.lintText(text, Object.assign({}, config || {}, {cwd, filename}));

	process.send({
		id: message.id,
		payload: report
	});
});

process.on('uncaughtException', err => {
	process.send({error: serializeError(err)});
});

function tryResolveLocal(id, basedir) {
	try {
		return resolve.sync(id, {basedir});
	} catch (err) {
		return require.resolve(id);
	}
}

function requireXO(cwd, config) {
	const cwdResolved = ['xo', 'eslint', config.parser];

	const stubs = cwdResolved.reduce((reg, id) => {
		const modulePath = tryResolveLocal(id, cwd);
		reg[id] = require(modulePath); // eslint-disable-line import/no-dynamic-require
		return reg;
	}, {});

	return proxyquire('xo', stubs);
}
