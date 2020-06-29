const test = require('ava');
const JsonFormatter = require('../../../lib/output/formatter/json');

let complexContext = {
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
  stringWithEscapes:'"\'\\\b\f\n\r\t\v',
};

test('simple', t => {
  let time = 1552384939508;
  let formatter = new JsonFormatter(null);
  t.is(formatter.format(time, 0, null, 'msg'), '{"$time":1552384939508,"$level":"trace","$message":"msg"}\n');
  t.is(formatter.format(time, 1, null, 'msg'), '{"$time":1552384939508,"$level":"debug","$message":"msg"}\n');
  t.is(formatter.format(time, 2, null, 'msg'), '{"$time":1552384939508,"$level":"info","$message":"msg"}\n');
  t.is(formatter.format(time, 3, null, 'msg'), '{"$time":1552384939508,"$level":"warn","$message":"msg"}\n');
  t.is(formatter.format(time, 4, null, 'msg'), '{"$time":1552384939508,"$level":"error","$message":"msg"}\n');
  t.is(formatter.format(time, 5, null, 'msg'), '{"$time":1552384939508,"$level":"fatal","$message":"msg"}\n');
});

test('tagged', t => {
  let time = 1552384939508;
  let formatter = new JsonFormatter(null);
  t.is(formatter.format(time, 0, 'some.tag', 'msg'), '{"$time":1552384939508,"$level":"trace","$tag":"some.tag","$message":"msg"}\n');
  t.is(formatter.format(time, 1, 'some.tag', 'msg'), '{"$time":1552384939508,"$level":"debug","$tag":"some.tag","$message":"msg"}\n');
  t.is(formatter.format(time, 2, 'some.tag', 'msg'), '{"$time":1552384939508,"$level":"info","$tag":"some.tag","$message":"msg"}\n');
  t.is(formatter.format(time, 3, 'some.tag', 'msg'), '{"$time":1552384939508,"$level":"warn","$tag":"some.tag","$message":"msg"}\n');
  t.is(formatter.format(time, 4, 'some.tag', 'msg'), '{"$time":1552384939508,"$level":"error","$tag":"some.tag","$message":"msg"}\n');
  t.is(formatter.format(time, 5, 'some.tag', 'msg'), '{"$time":1552384939508,"$level":"fatal","$tag":"some.tag","$message":"msg"}\n');
});

test('with context', t => {
  let time = 1552384939508;
  let formatter = new JsonFormatter(null);
  t.is(formatter.format(time, 0, 'some.tag', 'msg', complexContext), "{\"$time\":1552384939508,\"$level\":\"trace\",\"$tag\":\"some.tag\",\"$message\":\"msg\",\"string\":\"string\",\"number\":123.123,\"true\":true,\"false\":false,\"null\":null,\"complex key\":{\"a\":1},\"arr\":[\"string\",1,{\"number\":1},[1,2,3]],\"obj\":{\"string\":\"string\",\"subobj\":{\"number\":1},\"subarr\":[1,2,3]},\"emptyObj\":{},\"emptyArr\":[],\"date\":\"2019-03-09T21:37:43.708Z\",\"mediumArr\":[0,1,2,3,4,5,6,7,8,9,10],\"longArr\":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],\"stringWithEscapes\":\"\\\"'\\\\\\b\\f\\n\\r\\t\\u000b\"}\n");
  t.is(formatter.format(time, 0, 'some.tag', 'msg', {}), "{\"$time\":1552384939508,\"$level\":\"trace\",\"$tag\":\"some.tag\",\"$message\":\"msg\"}\n");
});
