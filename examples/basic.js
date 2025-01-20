import { log, logel } from 'logel';

class Test {
	constructor(value) {
		this.value = value;
	}
}

log.temp('this is temp');
log.trace('this is trace');
log.debug('this is debug');
log.info('this is info');
log.warn('this is warn');
log.error('this is error');

log.tagged('some-tag').info('this is tagged info');

log.info('values', {
	string: 'string',
	number: 123.123,
	true: true,
	false: false,
	null: null,
	undefined: undefined,
	'complex key': 123456,
	date: new Date(1552167463708),
	stringWithEscapes: '"\'\\\b\f\n\r\t\v\x1B\u2028\u2029',
	bigint: 0x123456789abcdefn,
	symbol: Symbol('test'),
	regexp: /qweasd/gm, //TODO
});

log.info('structures', {
	arr: ['string', 1, { number: 1 }, [1, 2, 3]],
	obj: {
		string: 'string',
		subobj: { number: 1 },
		subarr: [1, 2, 3],
	},
	emptyObj: {},
	emptyArr: [],
	mediumArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	longArr: [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
	],
	set: new Set([1, 2, 3]),
	map: new Map([
		['a', 1],
		['b', 2],
		['c', 3],
		[4, 4],
		[{ qwe: 1 }, 5],
		[6, { qwe: 1, asd: 2 }],
	]),
	instance: new Test([1, 2, 3]),
});

let object1 = { value: 'qwe' };
let object2 = { value: 'asd', object1 };
log.info('references', {
	object1,
	object2,
});

const makeError = (str) => {
	return new Error(str);
};

log.error('this is an error', {
	err: makeError('message'),
});

log.tagged('exit').fatal('fatal error occured');
