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

describe('json formatter', () => {
  test('simple', () => {
    let time = 1552384939508;
    let formatter = new JsonFormatter(null);
    expect(formatter.format(time, 0, null, 'msg')).toBe("{\"t\":1552384939508,\"l\":0,\"m\":\"msg\"}\n");
    expect(formatter.format(time, 1, null, 'msg')).toBe("{\"t\":1552384939508,\"l\":1,\"m\":\"msg\"}\n");
    expect(formatter.format(time, 2, null, 'msg')).toBe("{\"t\":1552384939508,\"l\":2,\"m\":\"msg\"}\n");
    expect(formatter.format(time, 3, null, 'msg')).toBe("{\"t\":1552384939508,\"l\":3,\"m\":\"msg\"}\n");
    expect(formatter.format(time, 4, null, 'msg')).toBe("{\"t\":1552384939508,\"l\":4,\"m\":\"msg\"}\n");
    expect(formatter.format(time, 5, null, 'msg')).toBe("{\"t\":1552384939508,\"l\":5,\"m\":\"msg\"}\n");
  });
  test('tagged', () => {
    let time = 1552384939508;
    let formatter = new JsonFormatter(null);
    expect(formatter.format(time, 0, 'some.tag', 'msg')).toBe("{\"t\":1552384939508,\"l\":0,\"g\":\"some.tag\",\"m\":\"msg\"}\n");
    expect(formatter.format(time, 1, 'some.tag', 'msg')).toBe("{\"t\":1552384939508,\"l\":1,\"g\":\"some.tag\",\"m\":\"msg\"}\n");
    expect(formatter.format(time, 2, 'some.tag', 'msg')).toBe("{\"t\":1552384939508,\"l\":2,\"g\":\"some.tag\",\"m\":\"msg\"}\n");
    expect(formatter.format(time, 3, 'some.tag', 'msg')).toBe("{\"t\":1552384939508,\"l\":3,\"g\":\"some.tag\",\"m\":\"msg\"}\n");
    expect(formatter.format(time, 4, 'some.tag', 'msg')).toBe("{\"t\":1552384939508,\"l\":4,\"g\":\"some.tag\",\"m\":\"msg\"}\n");
    expect(formatter.format(time, 5, 'some.tag', 'msg')).toBe("{\"t\":1552384939508,\"l\":5,\"g\":\"some.tag\",\"m\":\"msg\"}\n");
  });
  test('with context', () => {
    let time = 1552384939508;
    let formatter = new JsonFormatter(null);
    expect(formatter.format(time, 0, 'some.tag', 'msg', complexContext)).toBe("{\"t\":1552384939508,\"l\":0,\"g\":\"some.tag\",\"m\":\"msg\",\"c\":{\"string\":\"string\",\"number\":123.123,\"true\":true,\"false\":false,\"null\":null,\"complex key\":{\"a\":1},\"arr\":[\"string\",1,{\"number\":1},[1,2,3]],\"obj\":{\"string\":\"string\",\"subobj\":{\"number\":1},\"subarr\":[1,2,3]},\"emptyObj\":{},\"emptyArr\":[],\"date\":\"2019-03-09T21:37:43.708Z\",\"mediumArr\":[0,1,2,3,4,5,6,7,8,9,10],\"longArr\":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],\"stringWithEscapes\":\"\\\"'\\\\\\b\\f\\n\\r\\t\\u000b\"}}\n");
  });
})
