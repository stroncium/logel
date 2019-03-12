const fs = require('fs');
const ChildProcess = require('child_process');

describe('examples run fine', () => {
  let folder = './examples';

  function testExample(path){
    test(path, () => new Promise((resolve, reject) => {
      ChildProcess.exec('node '+path, {
        cwd: folder,
        env: {},
        timeout: 1000,
      }, err => err ? reject(err) : resolve());
    }));
  }

  fs.readdirSync(folder)
    .filter(filename => /\.js$/.test(filename))
    .forEach(path => {
      test(path, () => new Promise((resolve, reject) => {
        ChildProcess.exec('node '+path, {
          cwd: folder,
          env: {},
          timeout: 1000,
        }, err => err ? reject(err) : resolve());
      }));
    });
});
