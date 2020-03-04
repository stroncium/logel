const test = require('ava');

let Log = require('../lib/log');
let LEVELS = require('../lib/levels');

test('all logging methods work', t => {
  let logelWriteCallCounter = 0;
  let logelWrite = () => {
    logelWriteCallCounter++;
  };
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

  t.is(logelWriteCallCounter, 14);
});

test('all disabled logging methods work', t => {
  let logelWriteCallCounter = 0;
  let logelWrite = () => {
    logelWriteCallCounter++;
  };
  let logel = {
    write: logelWrite,
  }
  let log = new Log(logel, 'tag', LEVELS.error);

  //TODO not all levels are filtered on log level yet
  // log.warn('message');
  log.info('message');
  log.debug('message');
  log.trace('message');
  log.temp('message');

  // log.warn('message', {number:123, string:'abc', bool:true, object:{}});
  log.info('message', {number:123, string:'abc', bool:true, object:{}});
  log.debug('message', {number:123, string:'abc', bool:true, object:{}});
  log.trace('message', {number:123, string:'abc', bool:true, object:{}});
  log.temp('message', {number:123, string:'abc', bool:true, object:{}});

  t.is(logelWriteCallCounter, 0);
});

test('tags', t => {
  let log = new Log(null, null, LEVELS.fatal);
  let log2 = log.tagged('2');
  let log3 = log2.tagged('3');

  t.is(log.tag, null);
  t.is(log2.tag, '2');
  t.is(log3.tag, '2.3');
});
