const Log = require('./log');
const Url = require('url')
const QueryString = require('querystring')
const LEVELS = require('./levels');

const DEFAULT = {
  LEVEL: 'trace',
  OUT: 'std://out?pretty&color',
  FALLBACK: 'std://err',
  ROOT_TAG: '',
};

class Logel{
  constructor(cfg){
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

        let cl;
        switch(name){
          case 'std':
            cl = require('./output/std');
            break;
          case 'file':
            cl = require('./output/file');
            break;
          default:
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
  }

  log(){
    return new Log(this, this.cfg.rootTag, this.minLevelNum);
  }

  setRenderers(obj){
    for(let k of Object.keys(obj)) this.renderers[k] = obj[k];
    return this;
  }

  setDefaultRenderers(){
    return this.setRenderers(require('./std-renderers'));
  }

  write(log, level, message, ctx){
    if(LEVELS[level] < this.minLevelNum) return;
    let time = Date.now();
    let outputs = this.outputs;

    if(ctx != null){
      let keys = Object.keys(ctx);
      for(let k of keys){
        let rend = this.renderers[k];
        if(rend !== undefined) ctx[k] = rend(ctx[k]);
      }
    }

    for(let output of outputs){
      output.write(time, LEVELS[level], log.tag, message, ctx);
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

  static make(){
    let cfg = Logel.readCfg(process.env);
    return new Logel(cfg);
  }
}

module.exports = Logel
