let PrettyFormatter = require('../../../lib/output/formatter/pretty');

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

describe('pretty formatter', () => {
  test('config', () => {
    expect(PrettyFormatter.parseUrl({params:{color:'never'}})).toEqual({color:'never'});
    expect(PrettyFormatter.parseUrl({params:{color:'always'}})).toEqual({color:'always'});
    expect(PrettyFormatter.parseUrl({params:{color:'auto'}})).toEqual({color:'auto'});
    expect(PrettyFormatter.parseUrl({params:{color:''}})).toEqual({color:'auto'});
    expect(PrettyFormatter.parseUrl({params:{}})).toEqual({color:'never'});
    expect(PrettyFormatter.parseUrl({params:{color:'qweqwe'}})).toEqual({color:'auto'});
  });
  test('no-color', () => {
    let time = 1552384939508;
    let formatter = new PrettyFormatter({params:{color:'never'}});
    expect(formatter.format(time, 0, null, 'msg')).toBe('2019-03-12 10:02:19.508 TRACE msg\n');
    expect(formatter.format(time, 1, null, 'msg')).toBe('2019-03-12 10:02:19.508 DEBUG msg\n');
    expect(formatter.format(time, 2, null, 'msg')).toBe('2019-03-12 10:02:19.508 INFO  msg\n');
    expect(formatter.format(time, 3, null, 'msg')).toBe('2019-03-12 10:02:19.508 WARN  msg\n');
    expect(formatter.format(time, 4, null, 'msg')).toBe('2019-03-12 10:02:19.508 ERROR msg\n');
    expect(formatter.format(time, 5, null, 'msg')).toBe('2019-03-12 10:02:19.508 FATAL msg\n');
  });
  test('color', () => {
    let time = 1552384939508;
    let formatter = new PrettyFormatter({params:{color:'always'}});
    expect(JSON.stringify(formatter.format(time, 0, null, 'msg'))).toBe("\"\\u001b[35m2019-03-12 10:02:19.508 TRACE msg\\u001b[39m\\n\"");
    expect(JSON.stringify(formatter.format(time, 1, null, 'msg'))).toBe("\"2019-03-12 10:02:19.508 DEBUG msg\\n\"");
    expect(JSON.stringify(formatter.format(time, 2, null, 'msg'))).toBe("\"2019-03-12 10:02:19.508 INFO  msg\\n\"");
    expect(JSON.stringify(formatter.format(time, 3, null, 'msg'))).toBe("\"\\u001b[31m2019-03-12 10:02:19.508 WARN  msg\\u001b[39m\\n\"");
    expect(JSON.stringify(formatter.format(time, 4, null, 'msg'))).toBe("\"\\u001b[31m2019-03-12 10:02:19.508 \\u001b[30m\\u001b[41mERROR\\u001b[49m\\u001b[39m\\u001b[31m msg\\u001b[39m\\n\"");
    expect(JSON.stringify(formatter.format(time, 5, null, 'msg'))).toBe("\"\\u001b[30m\\u001b[41m2019-03-12 10:02:19.508 FATAL msg\\u001b[49m\\u001b[39m\\n\"");
  });
  test('no-color tagged', () => {
    let time = 1552384939508;
    let formatter = new PrettyFormatter({params:{color:'never'}});
    expect(formatter.format(time, 0, 'some.tag', 'msg')).toBe('2019-03-12 10:02:19.508 TRACE [some.tag] msg\n');
    expect(formatter.format(time, 1, 'some.tag', 'msg')).toBe('2019-03-12 10:02:19.508 DEBUG [some.tag] msg\n');
    expect(formatter.format(time, 2, 'some.tag', 'msg')).toBe('2019-03-12 10:02:19.508 INFO  [some.tag] msg\n');
    expect(formatter.format(time, 3, 'some.tag', 'msg')).toBe('2019-03-12 10:02:19.508 WARN  [some.tag] msg\n');
    expect(formatter.format(time, 4, 'some.tag', 'msg')).toBe('2019-03-12 10:02:19.508 ERROR [some.tag] msg\n');
    expect(formatter.format(time, 5, 'some.tag', 'msg')).toBe('2019-03-12 10:02:19.508 FATAL [some.tag] msg\n');
  });
  test('no-color with context', () => {
    let time = 1552384939508;
    let formatter = new PrettyFormatter({params:{color:'never'}});
    expect(JSON.stringify(formatter.format(time, 0, null, 'msg', complexContext))).toBe("\"2019-03-12 10:02:19.508 TRACE msg\\n\\tstring: 'string'\\n\\tnumber: 123.123\\n\\ttrue: true\\n\\tfalse: false\\n\\tnull: null\\n\\t['complex key'].a: 1\\n\\tarr[0]: 'string'\\n\\tarr[1]: 1\\n\\tarr[2].number: 1\\n\\tarr[3][0]: 1\\n\\tarr[3][1]: 2\\n\\tarr[3][2]: 3\\n\\tobj.string: 'string'\\n\\tobj.subobj.number: 1\\n\\tobj.subarr[0]: 1\\n\\tobj.subarr[1]: 2\\n\\tobj.subarr[2]: 3\\n\\temptyObj: {}\\n\\temptyArr: []\\n\\tdate: '2019-03-09T21:37:43.708Z'\\n\\tmediumArr[0]: 0\\n\\tmediumArr[1]: 1\\n\\tmediumArr[2]: 2\\n\\tmediumArr[3]: 3\\n\\tmediumArr[4]: 4\\n\\tmediumArr[5]: 5\\n\\tmediumArr[6]: 6\\n\\tmediumArr[7]: 7\\n\\tmediumArr[8]: 8\\n\\tmediumArr[9]: 9\\n\\tmediumArr[10]: 10\\n\\tlongArr[0]: 0\\n\\tlongArr[1]: 1\\n\\tlongArr[2]: 2\\n\\tlongArr[3]: 3\\n\\tlongArr[4]: 4\\n\\tlongArr[5]: 5\\n\\tlongArr[6]: 6\\n\\tlongArr[7]: 7\\n\\tlongArr[8]: 8\\n\\tlongArr[9]: 9\\n\\tlongArr[10 - 20]: [OMITTED]\\n\\tstringWithEscapes: '\\\"\\\\'\\\\\\\\\\\\b\\\\f\\\\n\\\\r\\\\t\\\\v'\\n\"");
  });
  test('color with context', () => {
    let time = 1552384939508;
    let formatter = new PrettyFormatter({params:{color:'always'}});
    expect(JSON.stringify(formatter.format(time, 0, null, 'msg', complexContext))).toBe("\"\\u001b[35m2019-03-12 10:02:19.508 TRACE msg\\u001b[39m\\n\\t\\u001b[36mstring\\u001b[39m: \\u001b[33m'string'\\u001b[39m\\n\\t\\u001b[36mnumber\\u001b[39m: \\u001b[34m123.123\\u001b[39m\\n\\t\\u001b[36mtrue\\u001b[39m: \\u001b[34mtrue\\u001b[39m\\n\\t\\u001b[36mfalse\\u001b[39m: \\u001b[34mfalse\\u001b[39m\\n\\t\\u001b[36mnull\\u001b[39m: \\u001b[35mnull\\u001b[39m\\n\\t\\u001b[33m['complex key']\\u001b[39m\\u001b[36m.a\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36marr\\u001b[39m\\u001b[34m[0]\\u001b[39m: \\u001b[33m'string'\\u001b[39m\\n\\t\\u001b[36marr\\u001b[39m\\u001b[34m[1]\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36marr\\u001b[39m\\u001b[34m[2]\\u001b[39m\\u001b[36m.number\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36marr\\u001b[39m\\u001b[34m[3]\\u001b[39m\\u001b[34m[0]\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36marr\\u001b[39m\\u001b[34m[3]\\u001b[39m\\u001b[34m[1]\\u001b[39m: \\u001b[34m2\\u001b[39m\\n\\t\\u001b[36marr\\u001b[39m\\u001b[34m[3]\\u001b[39m\\u001b[34m[2]\\u001b[39m: \\u001b[34m3\\u001b[39m\\n\\t\\u001b[36mobj\\u001b[39m\\u001b[36m.string\\u001b[39m: \\u001b[33m'string'\\u001b[39m\\n\\t\\u001b[36mobj\\u001b[39m\\u001b[36m.subobj\\u001b[39m\\u001b[36m.number\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36mobj\\u001b[39m\\u001b[36m.subarr\\u001b[39m\\u001b[34m[0]\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36mobj\\u001b[39m\\u001b[36m.subarr\\u001b[39m\\u001b[34m[1]\\u001b[39m: \\u001b[34m2\\u001b[39m\\n\\t\\u001b[36mobj\\u001b[39m\\u001b[36m.subarr\\u001b[39m\\u001b[34m[2]\\u001b[39m: \\u001b[34m3\\u001b[39m\\n\\t\\u001b[36memptyObj\\u001b[39m: {}\\n\\t\\u001b[36memptyArr\\u001b[39m: []\\n\\t\\u001b[36mdate\\u001b[39m: \\u001b[33m'2019-03-09T21:37:43.708Z'\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[0]\\u001b[39m: \\u001b[34m0\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[1]\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[2]\\u001b[39m: \\u001b[34m2\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[3]\\u001b[39m: \\u001b[34m3\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[4]\\u001b[39m: \\u001b[34m4\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[5]\\u001b[39m: \\u001b[34m5\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[6]\\u001b[39m: \\u001b[34m6\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[7]\\u001b[39m: \\u001b[34m7\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[8]\\u001b[39m: \\u001b[34m8\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[9]\\u001b[39m: \\u001b[34m9\\u001b[39m\\n\\t\\u001b[36mmediumArr\\u001b[39m\\u001b[34m[10]\\u001b[39m: \\u001b[34m10\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[0]\\u001b[39m: \\u001b[34m0\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[1]\\u001b[39m: \\u001b[34m1\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[2]\\u001b[39m: \\u001b[34m2\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[3]\\u001b[39m: \\u001b[34m3\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[4]\\u001b[39m: \\u001b[34m4\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[5]\\u001b[39m: \\u001b[34m5\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[6]\\u001b[39m: \\u001b[34m6\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[7]\\u001b[39m: \\u001b[34m7\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[8]\\u001b[39m: \\u001b[34m8\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[9]\\u001b[39m: \\u001b[34m9\\u001b[39m\\n\\t\\u001b[36mlongArr\\u001b[39m\\u001b[34m[10 - 20]\\u001b[39m: \\u001b[35m[OMITTED]\\u001b[39m\\n\\t\\u001b[36mstringWithEscapes\\u001b[39m: \\u001b[33m'\\\"\\\\'\\\\\\\\\\\\b\\\\f\\\\n\\\\r\\\\t\\\\v'\\u001b[39m\\n\"");
  });
});
