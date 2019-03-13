const {Logel} = require('logel');

let log = Logel.make()
  .setDefaultRenderers()
  .log();

log.trace('this is trace')
log.debug('this is debug')
log.info('this is info');
log.warn('this is warn');
log.error('this is error');

log.tagged('this.is.some.tag').trace('this is trace')
log.tagged('this.is.some.tag').debug('this is debug')
log.tagged('this.is.some.tag').info('this is info');
log.tagged('this.is.some.tag').warn('this is warn');
log.tagged('this.is.some.tag').error('this is error');

log.info('this is ctx test', {
  string: 'string',
  number: 123.123,
  true: true,
  false: false,
  null: null,
  'complex key': {a:1},
  arr: [
    'string',
    1,
    {number: 1},
    [1,2,3],
  ],
  obj: {
    string: 'string',
    subobj:{number: 1},
    subarr:[1,2,3],
  },
  emptyObj: {},
  emptyArr: [],
  date: new Date(1552167463708),
  mediumArr: [0,1,2,3,4,5,6,7,8,9,10],
  longArr: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  stringWithEscapes:'"\'\\\b\f\n\r\t\v\x1B\u2028\u2029',
});

function makeError(str){
  return new Error(str);
}

log.error('this is an error', {
  err: makeError('message'),
});

log.tagged('exit').fatal('fatal error occured');
