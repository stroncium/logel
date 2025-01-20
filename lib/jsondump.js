const reIdent = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const OBJECT_CONST = {}.__proto__.constructor;

const jsonString = JSON.stringify; //TODO
const jsonNumber = JSON.stringify; //TODO

// const DUMP_TAG = Symbol("dump-special-tag");
// const DUMP_CLASS_INSTANCE = Symbol("dump-class-instance");

const dumpSymbol = (v, ctx) => {
	return `{"$t":"symbol","desc":${jsonString(v.description)}}`;
};

const dumpDate = (v, ctx) => {
	return `{"$t":"date","t":${v.getTime()}}`;
};

const dumpRegExp = (v, ctx) => {
	let build = `{"$t":"regexp","source":${jsonString(v.source)}`;
	if (v.flags !== '') {
		build += `,"flags":${jsonString(v.flags)}`;
	}
	return `${build}}`;
};

const dumpObjectKeys = (obj, keys, notFirst, ctx) => {
	let keysLength = keys.length;
	let oldPath = ctx.path;

	let s = '';

	for (let i = 0; i < keysLength; i++) {
		let k = keys[i];
		let v = obj[k];
		if (notFirst) {
			s += ', ';
		} else {
			notFirst = true;
		}

		let newPath;
		if (reIdent.test(k)) {
			newPath = `${oldPath}.${k}`;
			s += `"${k}"`;
		} else {
			let escaped = jsonString(k);
			newPath = `${oldPath}[${escaped}]`;
			s += escaped;
		}

		s += ': ';
		ctx.path = newPath;
		s += dumpValue(v, ctx);
	}
	return s;
};

const dumpObject = (obj, ctx) => {
	let orig = obj;
	let dumpSymbol;
	if (obj[ctx.dump2] !== undefined) {
		dumpSymbol = ctx.dump2;
	} else if (obj[ctx.dump1] !== undefined) {
		dumpSymbol = ctx.dump1;
	}
	if (dumpSymbol !== undefined) {
		obj = obj[dumpSymbol](obj);
		if (obj === orig) {
			return DUMP_RECURSIVE;
		}
		return dumpValue(obj, ctx);
	}

	ctx.seen.set(orig, ctx.path);

	if (isArray(obj)) {
		return dumpArray(obj, ctx);
	}
	if (obj instanceof Error) {
		return dumpError(obj, ctx);
	}
	let clConst = obj.__proto__.constructor;
	switch (clConst) {
		case Map: {
			return dumpMap(obj, ctx);
		}
		case Set: {
			return dumpSet(obj, ctx);
		}
		case Date: {
			return dumpDate(obj, ctx);
		}
		case RegExp: {
			return dumpRegExp(obj, ctx);
		}
	}
	// if (obj instanceof Map) {
	// 	return dumpMap(obj, ctx);
	// }
	// if (obj instanceof Set) {
	// 	return dumpSet(obj, ctx);
	// }
	// if (clConst === Date) {
	// 	return dumpDate(obj, ctx);
	// }

	let keys = Object.keys(obj);

	if (clConst !== OBJECT_CONST) {
		return `{"$t":"inst", "$n":${jsonString(clConst.name)}${dumpObjectKeys(obj, keys, true, ctx)}}`;
	}
	return `{${dumpObjectKeys(obj, keys, false, ctx)}}`;
};

const dumpArray = (arr, ctx) => {
	let len = arr.length;
	if (len === 0) {
		return '[]';
	}

	let oldPath = ctx.path;
	let prePath = `${oldPath}[`;
	let s = '[';

	for (let i = 0; i < len; i++) {
		let v = arr[i];
		if (i > 0) {
			s += ', ';
		}
		ctx.path = `${prePath + i}]`;
		s += dumpValue(v, ctx);
	}
	s += ']';
	return s;
};

const dumpMap = (map, ctx) => {
	let oldPath = ctx.path;
	let prePath = `${oldPath}.entries[`;

	let s = '{"$t":"map", "entries":[';

	let i = 0;
	for (let [k, v] of map) {
		if (i > 0) {
			s += ', ';
		}
		ctx.path = `${prePath + i}][0]`;
		s += `[${dumpValue(k, ctx)}`;
		ctx.path = `${prePath + i}][1]`;
		s += `, ${dumpValue(v, ctx)}]`;
		i++;
	}
	s += ']}';
	return s;
};

const dumpSet = (set, ctx) => {
	let len = set.size;
	if (len === 0) {
		return '{"$t":"set", "values":[]}';
	}

	let oldPath = ctx.path;
	let prePath = `${oldPath}.values[`;
	let s = '{"$t":"set", "values":[';

	let i = 0;
	for (let v of set) {
		if (i > 0) {
			s += ', ';
		}
		ctx.path = `${prePath + i}]`;
		s += dumpValue(v, ctx);
		i++;
	}
	s += ']}';
	return s;
};

// const RE_STACK_TRACE = /^([0-9a-zA-Z_$-]+)(?: .*)?: ([^\n]*)\n([^]*)/m;
const parseStackTrace = (trace, message) => {
	if (!trace) {
		return undefined;
	}
	let type;
	let stackText;
	if (message !== undefined && message !== '') {
		let idx = trace.indexOf(message);
		if (idx !== -1) {
			type = trace.substr(0, idx - 2);
			stackText = trace.substr(idx + message.length + 1);
		}
	}
	// if (stackText === undefined) {
	// 	let m = RE_STACK_TRACE.exec(trace);
	// 	if (m !== null) {
	// 		type = m[1];
	// 		stackText = m[3];
	// 		message = m[2];
	// 	}
	// }
	if (stackText === undefined) {
		return undefined;
	}
	let stack = stackText.split('\n').map((s) => {
		s = s.trim();
		if (s.startsWith('at ')) s = s.substr(3).trim();
		return s;
	});

	return {
		message,
		stack,
		stackText,
	};
};

const dumpError = (err, ctx) => {
	const obj = {
		$t: 'inst',
		$n: err.constructor.name,
		message: err.message,
	};

	// let stack = parseStackTrace(err.stack, err.message);
	let stack = parseStackTrace(err.stack, err.message);
	if (stack !== undefined) {
		obj.stack = stack.stack;
	} else if (err.stack != null) {
		obj.stackText = err.stack;
	}

	return dumpObject(obj, ctx);
};

export const DUMP_TYPE_UNDEFINED = 'undefined';
export const DUMP_TYPE_UNKNOWN = 'unknown';
export const DUMP_TYPE_FUNCTION = 'fn';
export const DUMP_TYPE_INSTANCE = 'inst';
export const DUMP_TYPE_RECURSIVE = 'recursive';
export const DUMP_TYPE_BIGINT = 'bigint';

const justType = (t) => `{"$t":"${t}"}`;
const DUMP_UNDEFINED = justType(DUMP_TYPE_UNDEFINED);
const DUMP_UNKNOWN = justType(DUMP_TYPE_UNKNOWN);
const DUMP_FUNCTION = justType(DUMP_TYPE_FUNCTION);
const DUMP_RECURSIVE = justType(DUMP_TYPE_RECURSIVE);

const isArray = Array.isArray;

const dumpValue = (v, ctx) => {
	switch (typeof v) {
		case 'string':
			return jsonString(v);
		case 'number':
			return jsonNumber(v); //TODO
		case 'boolean':
			return v ? 'true' : 'false';
		case 'undefined':
			return DUMP_UNDEFINED;
		case 'object': {
			if (v === null) {
				return 'null';
			}
			let seenPath = ctx.seen.get(v);

			if (seenPath !== undefined) {
				return `{"$t":"ref","path":${jsonString(seenPath)}}`;
			}
			ctx.seen.set(v, ctx.path);
			return dumpObject(v, ctx);
		}
		case 'symbol':
			return dumpSymbol(v, ctx);
		case 'function':
			return DUMP_FUNCTION;
		case 'bigint':
			return `{"$t":"bigint","v":"${v.toString(10)}"}`;
		default:
			return DUMP_UNKNOWN;
	}
};

export const encodeJsondump = (v, dump1, dump2) => {
	let ctx = {
		seen: new Map(),
		path: '',
		dump1,
		dump2,
	};
	return dumpValue(v, ctx);
};

// const setClassDump = (cl, sym, fn) => {
// 	cl[sym] = fn; //TODO
// };
