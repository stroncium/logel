const test = require('ava');

const fs = require('fs');
const ChildProcess = require('child_process');

const runsFineIn1Second = path => new Promise((resolve, reject) => {
  ChildProcess.exec('node '+path, {
    env: {},
    timeout: 1000,
  }, err => err ? reject(err) : resolve());
});

for(let file of fs.readdirSync('./examples').filter(file => /\.js$/.test(file))) {
  let path = `examples/${file}`;
  test(path, async t => {
    await t.notThrowsAsync(runsFineIn1Second(path));
  });
}