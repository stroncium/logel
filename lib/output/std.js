let FdOutput = require('./fd');

module.exports = class StdOutput extends FdOutput{
  constructor(url){
    let cfg = StdOutput.parseUrl(url);
    super(cfg.fd, url);
  }

  close(){
    if(this.sync || this.stream.destroyed){
      return;
    }
    return new Promise((resolve, reject) => {
      this.stream.once('error', reject);
      if(this.stream.write('')) {
        resolve();
      }
      else {
        this.stream.once('drain', resolve);
      }
    });
  }

  static parseUrl(url){
    let dst = {out: '1', err: '2'}[url.host] || url.host;
    let fd = parseInt(dst);
    if(''+fd !== dst) throw new Error('Unknown std path: '+url.host);
    return {fd};
  }
}
