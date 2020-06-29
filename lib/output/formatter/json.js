const LEVELS = require('../../levels');

const LEVEL_JSON_NAMES = [];
for(let [name, idx] of Object.entries(LEVELS)) {
  LEVEL_JSON_NAMES[idx] = JSON.stringify(name);
}

module.exports = class JsonFormatter{
  constructor(url){
  }

  format(time, level, tag, msg, ctx){
    let str = '{"$time":'+time+',"$level":'+LEVEL_JSON_NAMES[level];
    if(tag != null) str+= ',"$tag":'+JSON.stringify(tag);
    str+= ',"$message":'+JSON.stringify(msg);
    if(ctx != null && typeof ctx === 'object'){
      let contextJson = JSON.stringify(ctx);
      if (contextJson !== '{}') {
        str+= ',';
        str+= contextJson.substr(1);
        str+= '\n';
      } else {
        str+= '}\n';
      }
    } else {
      str+= '}\n';
    }
    return str;
  }
}
