const Log = require('./log');
const Url = require('node:url')
const QueryString = require('node:querystring')
const LEVELS = require('./levels');
const {
  setLogelRender,
  renderValue,
  renderRootObject,
  LOGEL_RENDER,
  LOGEL_FINAL,
} = require('./render');

const DEFAULT = {
  LEVEL: 'trace',
  OUT: 'std://out?pretty&color',
  FALLBACK: 'std://err',
  ROOT_TAG: '',
};

const defaultOutputClasses = {
  std: require('./output/std'),
  file: require('./output/file'),
};

class Logel{
  constructor(renderSymbol){
    this.renderSymbol = renderSymbol ?? LOGEL_RENDER;
  }

  // setDefaultRenderers() {
  // }

  configure(cfg){
    this.cfg = cfg;
    this.minLevelNum = LEVELS[cfg.level];
    this.renderers = {};

    let errorDatas = [];
    this.outputs = cfg.outputs.map(src => {
      try{
        let url = Url.parse(src);
        url.src = src;
        url.params = QueryString.parse(url.query);
        let name = url.protocol;
        if(name == null) throw new Error('incorrect output config');
        name = name.substr(0, name.length-1);

        let cl = defaultOutputClasses[name];
        if(typeof cl !== 'function'){
          throw new Error('unknown output type '+name);
        }
        return new cl(url);
      }catch(err){
        errorDatas.push({src,err});
        return null;
      }
    }).filter(v => v != null);

    this.selfLog = this.log().tagged('logel');
    for(let data of errorDatas){
      this.selfLog.error('output initialization', data);
    }

    process.on('beforeExit', () => this.close());

    return this;
  }

  log(){
    return new Log(this, this.cfg.rootTag, this.minLevelNum);
  }

  setDefaultRenderers(){
    for(let [Class, fn] of require('./default-renderers').renderers.entries()) {
      setLogelRender(Class, this.renderSymbol, fn);
    }
    return this;
  }

  write(log, level, message, ctx){
    if(LEVELS[level] < this.minLevelNum) return;
    let time = Date.now();

    let renderedCtx = renderRootObject(ctx, this.renderSymbol);

    for(let output of this.outputs){
      output.write(time, LEVELS[level], log.tag, message, renderedCtx);
    }
  }

  async close() {
    for(let output of this.outputs) await output.close();
  }

  static readCfg(env, prefix = 'LOGEL_'){
    function def(name, d){
      return env[prefix+name] !== undefined ? env[prefix+name] : d;
    }

    let level = def('LEVEL', DEFAULT.LEVEL).trim();
    if(!Object.keys(LEVELS).includes(level)) level = DEFAULT.LEVEL; //TODO warning

    let fallback = def('FALLBACK', DEFAULT.FALLBACK).trim();
    if(fallback == '') fallback = null;

    let outputs = def('OUT', DEFAULT.OUT).split(',').map(v => v.trim());

    let rootTag = def('ROOT_TAG', DEFAULT.ROOT_TAG).trim() || null;
    return {
      outputs,
      fallback,
      level,
      rootTag,
    };
  }

  static make(sym = LOGEL_RENDER){
    return new Logel(sym).configure(Logel.readCfg(process.env));
  }
}

Logel.setRender = setLogelRender;

module.exports = {
  Logel,
}
