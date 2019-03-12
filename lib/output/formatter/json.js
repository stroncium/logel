module.exports = class JsonFormatter{
  constructor(url){
  }

  format(time, level, tag, msg, ctx){
    let str = '{"t":'+time+',"l":'+level;
    if(tag != null) str+= ',"g":'+JSON.stringify(tag);
    str+= ',"m":'+JSON.stringify(msg);
    if(ctx != null){
      str+= ',"c":'+JSON.stringify(ctx);
    }
    str+= '}\n';
    return str;
  }
}
