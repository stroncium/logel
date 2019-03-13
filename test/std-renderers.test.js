let rends = require('../lib/std-renderers');


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
