const fs = require('fs');
const SonicBoom = require('sonic-boom');

function buildSafeSonicBoom (fd, buffer = 0, sync = true) {
  const stream = new SonicBoom(fd, buffer, sync)
  // stream.on('error', filterBrokenPipe)
  return stream;

  // function filterBrokenPipe (err) {
  //   // TODO verify on Windows
  //   if (err.code === 'EPIPE') {
  //     // If we get EPIPE, we should stop logging here
  //     // however we have no control to the consumer of
  //     // SonicBoom, so we just overwrite the write method
  //     stream.write = noop
  //     stream.end = cb => cb(null);
  //     stream.flushSync = noop
  //     stream.destroy = noop
  //     return
  //   }
  //   stream.removeListener('error', filterBrokenPipe)
  //   stream.emit('error', err)
  // }
}

class FdOutput {
  constructor(fd, url){
    this.fd = fd;

    let cfg = FdOutput.parseUrl(url);
    this.sync = cfg.sync;
    this.pretty = cfg.pretty;

    if (this.pretty) {
      const PrettyFormatter = require('./formatter/pretty');
      this.formatter = new PrettyFormatter(url);
    } else {
      const JsonFormatter = require('./formatter/json');
      this.formatter = new JsonFormatter(url);
    }
    this.write = this.sync ? this.writeSync : this.writeAsync;
    if(!this.sync) this.stream = buildSafeSonicBoom(this.fd);
  }

  writeAsync(time, level, tag, msg, ctx) {
    this.stream.write(this.formatter.format(time, level, tag, msg, ctx), 'utf8');
  }

  writeSync(time, level, tag, msg, ctx) {
    fs.writeSync(this.fd, this.formatter.format(time, level, tag, msg, ctx), 'utf8');
  }

  close(){}

  static parseUrl(url) {
    return {
      sync: url.params.sync === '',
      pretty: url.params.pretty === '',
    };
  }
}

module.exports = FdOutput;