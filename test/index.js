const test = require('ava');

const {Logel, Log} = require('../');
const fs = require('fs');
// const ChildProcess = require('child_process');
// const Url = require('url');
// const QueryString = require('querystring');

async function createTestWritePipe(){
  let time = process.hrtime();
  let path = './pseudopipe'+time[0]+'-'+time[1]+'-'+Math.random();
  let fdWrite = await new Promise((resolve, reject) => fs.open(path, 'wx', (err, fd) => err ? reject(err) : resolve(fd)));
  let fdRead = await new Promise((resolve, reject) => fs.open(path, 'r', (err, fd) => err ? reject(err) : resolve(fd)));
  await new Promise((resolve, reject) => fs.unlink(path, err => err ? reject(err) : resolve()));

  function getOutput(){
    return new Promise((resolve, reject) => {
      let chunks = [];
      let stream = fs.createReadStream('', {fd:fdRead});
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('data', chunk => chunks.push(chunk));
    });
  }

  function close(){
    return new Promise((resolve,reject) => {
      fs.close(fdRead, err => err ? reject(err) : resolve());
    });
  }

  return {
    path,
    fd: fdWrite,
    getOutput,
    close,
  };
}


test('config default applied', t => {
  t.deepEqual(Logel.readCfg({}), {
    outputs: ['std://out?pretty&color'],
    fallback: 'std://err',
    level: 'trace',
    rootTag: null,
  });
});

test('config parses', t => {
  t.deepEqual(Logel.readCfg({
    OUT: 'std://out, std://err, file:///tmp/somelog?pretty',
    FALLBACK: 'std://err',
    LEVEL: 'debug',
    ROOT_TAG: 'test',
  }, ''), {
    outputs: ['std://out', 'std://err', 'file:///tmp/somelog?pretty'],
    fallback: 'std://err',
    level: 'debug',
    rootTag: 'test',
  });
  t.is(Logel.readCfg({FALLBACK: ''}, '').fallback, null);
});

test('invalid config parses', t => {
  t.is(Logel.readCfg({LEVEL: 'nonexistant'}, '').level, 'trace');
});

test('log can be created', t => {
  t.true( Logel.make().log() instanceof Log);
});

test('default renderers can be set', t => {
  t.notThrows(() => {
    Logel.make(Symbol('test')).setDefaultRenderers().log();
  });
});

test('invalid outputs produce errors', async t => {
  let pipe = await createTestWritePipe();
  let bus = new Logel().configure({
    outputs: ['std://'+pipe.fd, 'nonexistant://path', 'qwe', 'std://qwe'],
    fallback: null,
    level: 'trace',
  });
  bus.close();
  let output = await pipe.getOutput();
  let lines = output.toString().split('\n');
  let lastLine = lines.pop();
  t.is(lastLine, '');
  t.is(lines.length, 3);
  // t.log(lines[0]);
  t.regex(lines[0], /^\{"\$time":[0-9]+,"\$level":"error","\$tag":"logel","\$message":"output initialization","src":"nonexistant:\/\/path","err":\{\}\}$/);
  t.regex(lines[1], /^\{"\$time":[0-9]+,"\$level":"error","\$tag":"logel","\$message":"output initialization","src":"qwe","err":\{\}\}$/);
  t.regex(lines[2], /^\{"\$time":[0-9]+,"\$level":"error","\$tag":"logel","\$message":"output initialization","src":"std:\/\/qwe","err":\{\}\}$/);
});

test('root tag works', t => {
  let log = new Logel().configure({
    outputs: [],
    fallback: null,
    level: 'trace',
    rootTag: 'abc',
  }).log();
  t.is(log.tag, 'abc');
});
