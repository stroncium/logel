let Log = require('../lib/log');
let LEVELS = require('../lib/levels');

describe('log', () => {
  test('all logging methods work', () => {
    let logelWrite = jest.fn(() => {});
    let logel = {
      write: logelWrite,
    }
    let log = new Log(logel, 'tag', LEVELS.trace);

    log.fatal('message');
    log.error('message');
    log.warn('message');
    log.info('message');
    log.debug('message');
    log.trace('message');
    log.temp('message');

    log.fatal('message', {number:123, string:'abc', bool:true, object:{}});
    log.error('message', {number:123, string:'abc', bool:true, object:{}});
    log.warn('message', {number:123, string:'abc', bool:true, object:{}});
    log.info('message', {number:123, string:'abc', bool:true, object:{}});
    log.debug('message', {number:123, string:'abc', bool:true, object:{}});
    log.trace('message', {number:123, string:'abc', bool:true, object:{}});
    log.temp('message', {number:123, string:'abc', bool:true, object:{}});

    expect(logelWrite.mock.calls.length).toBe(14);
  });

  test('all disabled logging methods work', () => {
    let logelWrite = jest.fn(() => {});
    let logel = {
      write: logelWrite,
    }
    let log = new Log(logel, 'tag', LEVELS.warn);

    log.error('message');
    log.warn('message');
    log.info('message');
    log.debug('message');
    log.trace('message');
    log.temp('message');

    log.error('message', {number:123, string:'abc', bool:true, object:{}});
    log.warn('message', {number:123, string:'abc', bool:true, object:{}});
    log.info('message', {number:123, string:'abc', bool:true, object:{}});
    log.debug('message', {number:123, string:'abc', bool:true, object:{}});
    log.trace('message', {number:123, string:'abc', bool:true, object:{}});
    log.temp('message', {number:123, string:'abc', bool:true, object:{}});

    // for(let call of logelWrite.mock.calls.length)
  });

  test('tags', () => {
    let log = new Log(null, null, LEVELS.fatal);
    let log2 = log.tagged('2');
    let log3 = log2.tagged('3');

    expect(log.tag).toBe(null);
    expect(log2.tag).toBe('2');
    expect(log3.tag).toBe('2.3');
  });
});
