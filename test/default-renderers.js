const test = require('ava');

const {
	renderers,
	utils,
} = require('../lib/default-renderers');

const renderErr = renderers.get(Error);
class MyTestError extends Error{}

function makeError(message){
	let err = new MyTestError(message);
	err.code = 1337;
	err.someRandomObject = {a:1};
	err.causedBy = new Error('fake error');
	err.causedBy.stack = undefined;
	err.causedBy.causedBy = err.causedBy;
	return err;
}

test('err - error', t => {
	let err = makeError('my message');

	let rendered = renderErr(err);
	t.deepEqual({...rendered, stack: undefined}, {
		$type: 'MyTestError',
		message: 'my message',
		code: 1337,
		someRandomObject: {a:1},
		causedBy: {
			$type: 'Error',
			message: 'fake error',
			stack: undefined,
		},
		stack: undefined,
	});
	t.regex(rendered.stack[0], /makeError/);
	t.is(rendered.causedBy.causedBy, undefined);
	t.is(rendered.causedBy.stack, undefined);
});

test('parseStackTrace - newlines in message', t => {
	const msg = "Command failed with exit code 1: smartctl --json /lol\n{\n  \"json_format_version\": [\n    1,\n    0\n  ],\n  \"smartctl\": {\n    \"version\": [\n      7,\n      1\n    ],\n    \"svn_revision\": \"5022\",\n    \"platform_info\": \"x86_64-linux-5.5.2-arch1-1\",\n    \"build_info\": \"(local build)\",\n    \"argv\": [\n      \"smartctl\",\n      \"--json\",\n      \"/lol\"\n    ],\n    \"messages\": [\n      {\n        \"string\": \"/lol: Unable to detect device type\",\n        \"severity\": \"error\"\n      }\n    ],\n    \"exit_status\": 1\n  }\n}";
	const src = `Error: ${msg}\n    at makeError (/home/stronzi/projects/nodejs-smartctl/node_modules/execa/lib/error.js:58:11)\n    at handlePromise (/home/stronzi/projects/nodejs-smartctl/node_modules/execa/index.js:114:26)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\n    at async Object.device (/home/stronzi/projects/nodejs-smartctl/index.js:13:13)`;
	t.deepEqual(utils.parseStackTrace(src, msg), {
		'$type': 'Error',
		message: msg,
		stack: [
			'makeError (/home/stronzi/projects/nodejs-smartctl/node_modules/execa/lib/error.js:58:11)',
			'handlePromise (/home/stronzi/projects/nodejs-smartctl/node_modules/execa/index.js:114:26)',
			'processTicksAndRejections (internal/process/task_queues.js:93:5)',
			'async Object.device (/home/stronzi/projects/nodejs-smartctl/index.js:13:13)',
		],
	});
});

test('parseStackTrace - incorrect', t => {
	t.is(utils.parseStackTrace('just a string'), null);
});

test('parseStackTrace - normal', t => {
	t.deepEqual(utils.parseStackTrace('Error: message\n    at repl:1:9\n    at Script.runInThisContext (vm.js:124:20)\n    at REPLServer.defaultEval (repl.js:322:29)'), {
		'$type': 'Error',
		message: 'message',
		stack: [
			'repl:1:9',
			'Script.runInThisContext (vm.js:124:20)',
			'REPLServer.defaultEval (repl.js:322:29)',
		],
	});
});

test('parseStackTrace - weird', t => {
	t.deepEqual(utils.parseStackTrace('Error: message\n    repl:1:9\n    hut Script.runInThisContext (vm.js:124:20)'), {
		'$type': 'Error',
		message: 'message',
		stack: [
			'repl:1:9',
			'hut Script.runInThisContext (vm.js:124:20)',
		],
	});
});
