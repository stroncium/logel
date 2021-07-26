const test = require('ava');

const { parseDockerComposeLine } = require('../../lib/parser/docker-compose');

const lines = `
Attaching to test_1, test_2
test_1          | {"$time":1626969950920,"$level":"trace","$tag":"hey","$message":"test"}
test_2          | {"$time":1626969950920,"$level":"trace","$tag":"world","$message":"test"}
`.split('\n');

test('lines', t => {
	t.notThrows(() => {
		for(line of lines) {
			parseDockerComposeLine(line);
		}
	})
});
