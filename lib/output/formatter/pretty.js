const LEVELS = {
  fatal: 5,
  error: 4,
  warn: 3,
  info: 2,
  debug: 1,
  trace: 0,
};

const reIdent = /^[$a-zA-Z_][$a-zA-Z0-9_]*$/;

let reEscape = /["'\\\b\f\n\r\t\v\x1B\u2028\u2029]/g;
let escapeMap = {
  '"': '\"',
  '\'': '\\\'',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\v': '\\v',
  '\x1B': '\\x1B',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

function escapeString(str){
  return "'"+str.replace(reEscape, ch => escapeMap[ch])+"'";
}

class Serializer{
  constructor(opts){
    this.styler = opts.styler;
    this.maxArrayItemsToDisplay = opts.maxArrayItemsToDisplay;
  }

  serializeValue(v, depth){
    let str;
    switch(typeof v){
      case 'string':
        return this.styler.string(escapeString(v)); //TODO cut long strings, configure
      case 'number':
        return this.styler.number(''+v);
      case 'boolean':
        return this.styler.number(v ? 'true' : 'false');
      case 'object':
        if(v === null) {
          return this.styler.null('null');
        }
        if(Array.isArray(v)) return this.serializeArray(v, depth);
        if(typeof v.toJSON === 'function'){
          return this.serializeValue(v.toJSON(), depth);
        }
        return this.serializeObject(v, depth);
    }
  }

  serializeArray(arr, depth){
    if(arr.length === 0){
      return '[]';
    }
    let lines = [];
    let l = Math.min(arr.length, this.maxArrayItemsToDisplay);
    if(l+1 == arr.length) l++;
    for(let i = 0; i < l; i++){
      let pathPart = this.styler.number('['+i+']');

      let serialized = this.serializeValue(arr[i], depth+1);
      if(serialized.multi != null){
        lines = lines.concat(serialized.multi.map(l => pathPart+l));
      }
      else{
        lines.push(pathPart+': '+serialized);
      }
    }
    if(l < arr.length){
      lines.push(this.styler.number('['+l+' - '+(arr.length-1)+']')+': '+this.styler.null('[OMITTED]'));
    }
    return {
      multi: lines,
    };
  }

  serializeObject(obj, depth){
    let keys = Object.keys(obj);
    if(keys.length === 0){
      return '{}';
    }
    let lines = [];
    for(let k of keys){
      let pathPart;
      if(reIdent.test(k)){
        pathPart = this.styler.field((depth !== 0) ? ('.'+k) : k);
      }else{
        pathPart = this.styler.string('['+escapeString(k)+']');
      }

      let serialized = this.serializeValue(obj[k], depth+1);
      if(serialized.multi != null){
        lines = lines.concat(serialized.multi.map(l => pathPart+l));
      }
      else{
        lines.push(pathPart+': '+serialized);
      }
    }
    return {
      multi: lines,
    };
  }
}

module.exports = class PrettyFormatter{
  constructor(url){
    let cfg = PrettyFormatter.parseUrl(url);
    this.color = (cfg.color === 'auto') ? PrettyFormatter.detectAutoColor() : (cfg.color === 'always');
    this.maxArrayItemsToDisplay = 10;

    if(this.color){
      const chalk = require('chalk');
      this.styler = {
        nonJsonLine: chalk.black.bgWhite,
        string: chalk.yellow,
        number: chalk.blue,
        boolean: chalk.blue,
        null: chalk.magenta,
        field: chalk.cyan,
        tag: chalk.green,

        traceLine: (date,line) => chalk.magenta(date+' TRACE '+line),
        debugLine: (date,line) => date+' DEBUG '+line,
        infoLine: (date,line) => date+' INFO  '+line,
        warnLine: (date,line) => chalk.red(date+' WARN  '+line),
        errorLine: (date,line) => chalk.red(date+' '+chalk.black.bgRed('ERROR')+' '+line),
        fatalLine: (date,line) => chalk.black.bgRed(date+' FATAL '+line),
      };
    }else{
      let noop = v => v;
      this.styler = {
        nonJsonLine: noop,
        string: noop,
        number: noop,
        boolean: noop,
        null: noop,
        field: noop,
        tag: noop,

        traceLine: (date,line) => date+' TRACE '+line,
        debugLine: (date,line) => date+' DEBUG '+line,
        infoLine: (date,line) => date+' INFO  '+line,
        warnLine: (date,line) => date+' WARN  '+line,
        errorLine: (date,line) => date+' ERROR '+line,
        fatalLine: (date,line) => date+' FATAL '+line,
      };
    }
    this.serializer = new Serializer({styler:this.styler, maxArrayItemsToDisplay: this.maxArrayItemsToDisplay});
  }

  format(time, level, tag, msg, ctx) {
    let date = new Date(time).toISOString();

    let sublines = '';
    if(ctx != null){
      let prefix = '\n\t';
      let serialized = this.serializer.serializeValue(ctx, 0);
      for(let s of serialized.multi){
        sublines+= prefix+s;
      }
    }

    let line = (tag ? this.styler.tag('['+tag+']')+' ' : '') + msg;

    let levelLine;
    switch(level){
      case LEVELS.trace: levelLine = this.styler.traceLine(date, line); break;
      case LEVELS.debug: levelLine = this.styler.debugLine(date, line); break;
      case LEVELS.info: levelLine = this.styler.infoLine(date, line); break;
      case LEVELS.warn: levelLine = this.styler.warnLine(date, line); break;
      case LEVELS.error: levelLine = this.styler.errorLine(date, line); break;
      case LEVELS.fatal: levelLine = this.styler.fatalLine(date, line); break;
    }
    return levelLine+sublines+'\n';
  }

  static detectAutoColor(){
    return true;
  }

  static parseUrl(url){
    let color = 'never';
    if(url.params.color !== undefined){
      color = 'auto';
      if('always,never,auto,'.split(',').includes(url.params.color)) color = url.params.color;
      if(color === '') color = 'auto';
    }

    return {
      color,
    };
  }
}
