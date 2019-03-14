const LEVELS = require('./levels');

module.exports = class Log{
  constructor(bus, tag, minLevelNum){
    this.bus = bus;
    this.tag = tag;

    // fast track for frequent possibly disabled methods
    Object.defineProperty(this, 'trace', {value: (LEVELS.trace < minLevelNum) ? this.doNothing : this.trace });
    Object.defineProperty(this, 'debug', {value: (LEVELS.debug < minLevelNum) ? this.doNothing : this.debug });
    Object.defineProperty(this, 'info', {value: (LEVELS.info < minLevelNum) ? this.doNothing : this.info });
  }

  tagged(tag){
    let childTag = this.tag == null ? tag : this.tag+'.'+tag;
    return new Log(this.bus, childTag, this.minLevelNum);
  }

  doNothing(message, data){}

  fatal(message, data){
    this.bus.write(this, 'fatal', message, data);
  }

  error(message, data){
    this.bus.write(this, 'error', message, data);
  }

  warn(message, data){
    this.bus.write(this, 'warn', message, data);
  }

  info(message, data){
    this.bus.write(this, 'info', message, data);
  }

  debug(message, data){
    this.bus.write(this, 'debug', message, data);
  }

  trace(message, data){
    this.bus.write(this, 'trace', message, data);
  }

  temp(message, data){
    this.trace(message, data);
  }
}
