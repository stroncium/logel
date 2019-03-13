const LEVELS = require('./levels');

module.exports = class Log{
  constructor(bus, tag, minLevelNum){
    this.bus = bus;
    this.tag = tag;

    this.trace = (minLevelNum > LEVELS.trace) ? this.doNothing : this.trace;
    this.debug = (minLevelNum > LEVELS.debug) ? this.doNothing : this.debug;
    this.info = (minLevelNum > LEVELS.info) ? this.doNothing : this.info;
    this.warn = (minLevelNum > LEVELS.warn) ? this.doNothing : this.warn;
    this.error = (minLevelNum > LEVELS.error) ? this.doNothing : this.error;
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
