let FdOutput = require('./fd');

module.exports = class FileOutput extends FdOutput{
  constructor(url){
    throw new Error('not implemented');
    super(fd, url);
  }

  close(){
    if(this.sync || this.stream.destroyed){
      return; //TODO close sync
    }
    return new Promise((resolve, reject) => {
      this.stream.once('error', reject);
      this.stream.once('close', resolve);
      this.stream.end()
    });
  }
}
