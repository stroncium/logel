const {Logel, Log} = require('../');
const fs = require('fs');
const ChildProcess = require('child_process');
const Url = require('url');
const QueryString = require('querystring');

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


describe('config', () => {

  test('default  applied', () => {
    expect(Logel.readCfg({})).toEqual({
      outputs: ['std://out?pretty&color'],
      fallback: 'std://err',
      level: 'trace',
      rootTag: null,
    });
  });

  test('parses', () => {
    expect(Logel.readCfg({
      OUT: 'std://out, std://err, file:///tmp/somelog?pretty',
      FALLBACK: 'std://err',
      LEVEL: 'debug',
      ROOT_TAG: 'test',
    }, '')).toEqual({
      outputs: ['std://out', 'std://err', 'file:///tmp/somelog?pretty'],
      fallback: 'std://err',
      level: 'debug',
      rootTag: 'test',
    });
    expect(Logel.readCfg({FALLBACK: ''}, '')).toHaveProperty('fallback', null);
  });

  test('invalid parses', () => {
    expect(Logel.readCfg({LEVEL: 'nonexistant'}, '')).toHaveProperty('level', 'trace');
  });

});

describe('methods', () => {

  test('log can be created', () => {
    let log = Logel.make().log();
    expect(log).toBeInstanceOf(Log);
  });
  test('default renderers can be set', () => {
    let log = Logel.make().setDefaultRenderers().log();
  });

  test('invalid outputs', async () => {
    let pipe = await createTestWritePipe();
    let bus = new Logel().configure({
      outputs: ['std://'+pipe.fd, 'nonexistant://path', 'qwe', 'std://qwe'],
      fallback: null,
      level: 'trace',
    });
    bus.close();
    let output = await pipe.getOutput();
    let lines = output.toString().split('\n');
    expect(lines.pop()).toBe('');
    expect(lines.length).toBe(3);
    expect(lines[0]).toMatch(/^\{"t":[0-9]+,"l":4,"g":"logel","m":"output initialization","c":\{"src":"nonexistant:\/\/path","err":\{\}\}\}$/);
    expect(lines[1]).toMatch(/^\{"t":[0-9]+,"l":4,"g":"logel","m":"output initialization","c":\{"src":"qwe","err":\{\}\}\}$/);
    expect(lines[2]).toMatch(/^\{"t":[0-9]+,"l":4,"g":"logel","m":"output initialization","c":\{"src":"std:\/\/qwe","err":\{\}\}\}$/);
  });

  test('root tag', () => {
    let log = new Logel().configure({
      outputs: [],
      fallback: null,
      level: 'trace',
      rootTag: 'abc',
    }).log();
    expect(log.tag).toBe('abc');
  });
});

