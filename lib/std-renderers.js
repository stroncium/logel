var seen = Symbol('circular-ref-tag')

const RE_STACK_TRACE = /^([0-9a-zA-Z_$-]+)(?: .*)?: ([^\n]*)\n([^]*)/m;
function parseStackTrace(trace){
  if(!trace){
    return null;
  }
  let m = RE_STACK_TRACE.exec(trace);
  if(m == null){
    return null;
  }
  let stack = m[3].split('\n').map(s => {
    s = s.trim();
    if(s.startsWith('at ')) s = s.substr(3).trim();
    return s;
  });
  return {
    $type: m[1],
    message: m[2],
    stack,
  };
}

function renderErr(err) {
  if (!(err instanceof Error)) {
    return err;
  }

  var obj = {
    $type: err.constructor.name,
    message: err.message,
    stack: undefined,
  };

  err[seen] = seen;
  for(var key in err){
    var val = err[key];
    if(!(val instanceof Error)) {
      obj[key] = val;
    } else if(!val.hasOwnProperty(seen)){
      obj[key] = renderErr(val);
    }
  }
  delete err[seen];

  let stack = parseStackTrace(err.stack);
  if(stack != null){
    obj.stack = stack.stack;
  } else if (err.stack != null) {
    obj.stackText = err.stack;
  }

  return obj;
}

module.exports = {
  renderers: {
    err: renderErr,
  },
  utils: {
    parseStackTrace,
  }
};
