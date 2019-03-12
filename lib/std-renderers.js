var seen = Symbol('circular-ref-tag')

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

  if(typeof err.stack === 'string'){
    let stack = err.stack.split('\n');
    stack.shift();
    obj.stack = stack.map(s => s.trim());
  }

  delete err[seen];

  return obj;
}

module.exports = {
  err: renderErr,
}
