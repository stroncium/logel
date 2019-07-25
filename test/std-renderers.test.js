let rends = require('../lib/std-renderers').renderers;
let utils = require('../lib/std-renderers').utils;

describe('std renderers', () => {
  test('err', () => {
    class MyTestError extends Error{}

    function makeMyTestError(message){
      let err = new MyTestError(message);
      err.code = 1337;
      err.someRandomObject = {a:1};
      err.causedBy = new Error('fake error');
      err.causedBy.stack = undefined;
      err.causedBy.causedBy = err.causedBy;
      return err;
    }

    expect(rends.err('string')).toBe('string');
    expect(rends.err({})).toEqual({});

    let err = rends.err(makeMyTestError('my message'));
    expect(err).toMatchObject({
      $type: 'MyTestError',
      message: 'my message',
      code: 1337,
      someRandomObject: {a:1},
      causedBy: {
        $type: 'Error',
        message: 'fake error',
      },
    });
    expect(err.stack[0]).toMatch(/makeMyTestError/);
    expect(err.causedBy.causedBy).toBe(undefined);
    expect(err.causedBy.stack).toBe(undefined);
  });
});

describe('std renderers utils', () => {
  test('parseStackTrace', () => {
    expect(utils.parseStackTrace('just a string')).toBe(null);

    let validStackTrace = 'Error: message\n    at repl:1:9\n    at Script.runInThisContext (vm.js:124:20)\n    at REPLServer.defaultEval (repl.js:322:29)';

    expect(utils.parseStackTrace(validStackTrace))
      .toEqual({
        '$type': 'Error',
        message: 'message',
        stack: [
          'repl:1:9',
          'Script.runInThisContext (vm.js:124:20)',
          'REPLServer.defaultEval (repl.js:322:29)',
        ],
      });
    let weirdStackTrace = 'Error: message\n    repl:1:9\n    hut Script.runInThisContext (vm.js:124:20)';
    expect(utils.parseStackTrace(weirdStackTrace))
      .toEqual({
        '$type': 'Error',
        message: 'message',
        stack: [
          'repl:1:9',
          'hut Script.runInThisContext (vm.js:124:20)',
        ],
      });
  });
});
