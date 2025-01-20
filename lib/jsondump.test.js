import test from 'ava';

import { encodeJsondump as realEncodeJsonDump } from './jsondump.js';

let DUMP1 = Symbol('DUMP1');
let DUMP2 = Symbol('DUMP2');

const encodeJsondump = (...args) => {
	let json = realEncodeJsonDump(...args);
	try {
		JSON.parse(json);
	} catch (err) {
		err.json = json;
		throw err;
	}
	return json;
};

const SIMPLE_VALUES = [
	{
		name: 'string',
		value: 'string',
		json: 'string',
	},
	{
		name: 'string with escapes',
		value: '"\'\\\b\f\n\r\t\v\x1B\u2028\u2029',
		json: '"\'\\\b\f\n\r\t\v\x1B\u2028\u2029',
	},
	{
		name: 'true',
		value: true,
		json: true,
	},
	{
		name: 'false',
		value: false,
		json: false,
	},
	{
		name: 'integer',
		value: 123,
		json: 123,
	},
	{
		name: 'negative integer',
		value: 123,
		json: 123,
	},
	{
		name: 'float',
		value: 123.123,
		json: 123.123,
	},
	{
		name: 'negative float',
		value: -123.123,
		json: -123.123,
	},
	{
		name: 'null',
		value: null,
		json: null,
	},
	{
		name: 'undefined',
		value: undefined,
		json: { $t: 'undefined' },
	},
	{
		name: 'symbol',
		value: Symbol('test symbol'),
		json: { $t: 'symbol', desc: 'test symbol' },
	},
	{
		name: 'function',
		value: () => {},
		json: { $t: 'fn' },
	},
	{
		name: 'bigint',
		value: 0x123456789abcdefn,
		json: { $t: 'bigint', v: '81985529216486895' },
	},
	{
		name: 'negative bigint',
		value: -0x123456789abcdefn,
		json: { $t: 'bigint', v: '-81985529216486895' },
	},
];

for (let { name, value, json } of SIMPLE_VALUES) {
	test(`simple ${name}`, (t) => {
		let res = encodeJsondump(value, DUMP1, DUMP2);
		t.deepEqual(JSON.parse(res), json);
	});
	test(`simple ${name} x2 in array`, (t) => {
		let res = encodeJsondump([value, value], DUMP1, DUMP2);
		t.deepEqual(JSON.parse(res), [json, json]);
	});
	test(`simple ${name} x2 in object`, (t) => {
		let res = encodeJsondump(
			{
				v1: value,
				v2: value,
			},
			DUMP1,
			DUMP2,
		);
		t.deepEqual(JSON.parse(res), { v1: json, v2: json });
	});
}
test('object empty', (t) => {
	t.is(encodeJsondump({}, DUMP1, DUMP2), '{}');
});

test('date', (t) => {
	t.is(
		encodeJsondump(new Date('2025-01-17T15:46:33.645Z'), DUMP1, DUMP2),
		'{"$t":"date","t":1737128793645}',
	);
});

test('regexp', (t) => {
	t.is(encodeJsondump(/qwe/, DUMP1, DUMP2), '{"$t":"regexp","source":"qwe"}');
});

test('regexp with flags', (t) => {
	t.is(
		encodeJsondump(/qwe/im, DUMP1, DUMP2),
		'{"$t":"regexp","source":"qwe","flags":"im"}',
	);
});

test('map empty', (t) => {
	t.is(encodeJsondump(new Map(), DUMP1, DUMP2), '{"$t":"map", "entries":[]}');
});

test('map mixed', (t) => {
	t.is(
		encodeJsondump(
			new Map([
				['a', 1],
				[2, 'b'],
				[Symbol('key'), {}],
				[{}, []],
			]),
			DUMP1,
			DUMP2,
		),
		'{"$t":"map", "entries":[["a", 1], [2, "b"], [{"$t":"symbol","desc":"key"}, {}], [{}, []]]}',
	);
});

test('map paths', (t) => {
	let k = {};
	let v = {};
	t.is(
		encodeJsondump(
			{
				map: new Map([[k, v]]),
				k,
				v,
			},
			DUMP1,
			DUMP2,
		),
		'{"map": {"$t":"map", "entries":[[{}, {}]]}, "k": {"$t":"ref","path":".map.entries[0][0]"}, "v": {"$t":"ref","path":".map.entries[0][1]"}}',
	);
});

test('set empty', (t) => {
	t.is(encodeJsondump(new Set(), DUMP1, DUMP2), '{"$t":"set", "values":[]}');
});

test('set mixed', (t) => {
	t.is(
		encodeJsondump(new Set(['a', 1, Symbol('key'), {}, []]), DUMP1, DUMP2),
		'{"$t":"set", "values":["a", 1, {"$t":"symbol","desc":"key"}, {}, []]}',
	);
});

test('set paths', (t) => {
	let k = {};
	let v = {};
	t.is(
		encodeJsondump(
			{
				set: new Set([k, v]),
				k,
				v,
			},
			DUMP1,
			DUMP2,
		),
		'{"set": {"$t":"set", "values":[{}, {}]}, "k": {"$t":"ref","path":".set.values[0]"}, "v": {"$t":"ref","path":".set.values[1]"}}',
	);
});

test('array empty', (t) => {
	t.is(encodeJsondump([], DUMP1, DUMP2), '[]');
});

test('array 1 element', (t) => {
	t.is(encodeJsondump([1], DUMP1, DUMP2), '[1]');
});

test('array 2 elements', (t) => {
	t.is(encodeJsondump([1, 'a'], DUMP1, DUMP2), '[1, "a"]');
});

test('object seen in object', (t) => {
	let o = {};
	t.is(
		encodeJsondump({ o1: o, o2: o }, DUMP1, DUMP2),
		'{"o1": {}, "o2": {"$t":"ref","path":".o1"}}',
	);
});

test('object recursive', (t) => {
	let o = { o: undefined };
	o.o = o;
	t.is(encodeJsondump(o, DUMP1, DUMP2), '{"o": {"$t":"ref","path":""}}');
});

test('object recursive with path', (t) => {
	let o = { o: undefined };
	o.o = o;
	t.is(
		encodeJsondump({ obj: o }, DUMP1, DUMP2),
		'{"obj": {"o": {"$t":"ref","path":".obj"}}}',
	);
});

test('object seen in array', (t) => {
	let o = {};
	t.is(encodeJsondump([o, o], DUMP1, DUMP2), '[{}, {"$t":"ref","path":"[0]"}]');
});

test('object with weird key', (t) => {
	t.is(encodeJsondump({ 'weird key': 1 }, DUMP1, DUMP2), '{"weird key": 1}');
});

test('fn', (t) => {
	t.is(
		encodeJsondump(
			{
				string: 'a',
				[DUMP1]: (v) => {
					return `string ${v.string}`;
				},
			},
			DUMP1,
			DUMP2,
		),
		'"string a"',
	);
});

test('fn this', (t) => {
	t.is(
		encodeJsondump(
			{
				string: 'a',
				[DUMP1]: function () {
					return `string ${this.string}`;
				},
			},
			DUMP1,
			DUMP2,
		),
		'"string a"',
	);
});

test('fn recursive', (t) => {
	t.is(
		encodeJsondump(
			{
				string: 'a',
				[DUMP1]: (v) => {
					return v;
				},
			},
			DUMP1,
			DUMP2,
		),
		'{"$t":"recursive"}',
	);
});

test('fn precedence', (t) => {
	t.is(
		encodeJsondump(
			{
				string: 'a',
				[DUMP1]: (v) => {
					return `string ${v.string}`;
				},
				[DUMP2]: (v) => {
					return `other string ${v.string}`;
				},
			},
			DUMP1,
			DUMP2,
		),
		'"other string a"',
	);
	t.is(
		encodeJsondump(
			{
				string: 'a',
				[DUMP1]: (v) => {
					return `string ${v.string}`;
				},
			},
			DUMP1,
			DUMP2,
		),
		'"string a"',
	);
});

test('fn class value', (t) => {
	class Cl {
		constructor(string) {
			this.string = string;
		}

		[DUMP1](v) {
			return `string ${v.string}`;
		}
	}
	t.is(encodeJsondump(new Cl('a'), DUMP1, DUMP2), '"string a"');
});

test('fn class this value', (t) => {
	class Cl {
		constructor(string) {
			this.string = string;
		}

		[DUMP1]() {
			return `string ${this.string}`;
		}
	}
	t.is(encodeJsondump(new Cl('a'), DUMP1, DUMP2), '"string a"');
});

test('fn class instance', (t) => {
	class Cl {
		constructor(string) {
			this.string = string;
		}

		[DUMP1](v) {
			return `string ${v.string}`;
		}
	}
	t.is(encodeJsondump(new Cl('a'), DUMP1, DUMP2), '"string a"');
});

test('class instance', (t) => {
	class Cl {
		constructor(string) {
			this.string = string;
		}
	}
	t.is(
		encodeJsondump(new Cl('a'), DUMP1, DUMP2),
		'{"$t":"inst", "$n":"Cl", "string": "a"}',
	);
});

test('error', (t) => {
	t.true(
		encodeJsondump(new Error('test'), DUMP1, DUMP2).startsWith(
			'{"$t": "inst", "$n": "Error", "message": "test", "stack": [',
		),
	);
	// t.is(
	// 	encodeJsondump(new Error('test'), DUMP1, DUMP2),
	// 	'{"$t": "inst", "$n": "Error", "message": "test", "stack": ['
	// );
});

test('error without stack', (t) => {
	let err = new Error('test');
	err.stack = undefined;
	t.is(
		encodeJsondump(err, DUMP1, DUMP2),
		'{"$t": "inst", "$n": "Error", "message": "test"}',
	);
});

test('error with weird stack', (t) => {
	let err = new Error('test');
	err.stack = 'doesnt look like a stack trace';
	t.is(
		encodeJsondump(err, DUMP1, DUMP2),
		'{"$t": "inst", "$n": "Error", "message": "test", "stackText": "doesnt look like a stack trace"}',
	);
});

// // test('', t => {
// // 	t.is(encodeJsondump(, DUMP1, DUMP2), '');
// // });
// // test('', t => {
// // 	t.is(encodeJsondump(, DUMP1, DUMP2), '');
// // });
// // test('', t => {
// // 	t.is(encodeJsondump(, DUMP1, DUMP2), '');
// // });
// // test('', t => {
// // 	t.is(encodeJsondump(, DUMP1, DUMP2), '');
// // });
// // test('', t => {
// // 	t.is(encodeJsondump(, DUMP1, DUMP2), '');
// // });

// // class Error2 extends Error {}

// // setClassDump(Error, DUMP, renderErr);

// // // console.log(encodeJsondump(o1, DUMP, DUMP));
// // // console.log(encodeJsondump(o2, DUMP, DUMP));
// // // console.log(encodeJsondump(o3, DUMP1, DUMP2));
// // // console.log(encodeJsondump(new Lol(), DUMP1, DUMP2));
// // let err2 = new Error2("err2");
// // // console.log(encodeJsondump(new Error('test'), DUMP1, DUMP2));
// // console.log(encodeJsondump(err2, DUMP1, DUMP2));

// // // let err3 = new Error('recursive error');
// // // err3.causedBy = err3;
// // // console.log(encodeJsondump(err3, DUMP1, DUMP2));
