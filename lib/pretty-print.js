import { Chalk } from 'chalk';
const reIdent = /^[$a-zA-Z_][$a-zA-Z0-9_]*$/;

// biome-ignore lint/suspicious/noControlCharactersInRegex: does not apply
let reEscape = /["'\\\b\f\n\r\t\v\x1B\u2028\u2029]/g;
let escapeMap = {
	'"': '"',
	"'": "\\'",
	'\\': '\\\\',
	'\b': '\\b',
	'\f': '\\f',
	'\n': '\\n',
	'\r': '\\r',
	'\t': '\\t',
	'\v': '\\v',
	'\x1B': '\\x1B',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029',
};

const escapeString = (str) => {
	return `'${str.replace(reEscape, (ch) => escapeMap[ch])}'`;
};

const serializeArray = (arr, styles) => {
	if (arr.length === 0) {
		return '[]';
	}
	let lines = [];
	let l = Math.min(arr.length, styles.maxArrayItemsToDisplay);
	if (l + 1 === arr.length) {
		l++;
	}
	for (let i = 0; i < l; i++) {
		let pathPart = styles.number(`[${i}]`);

		let serialized = serializeValue(arr[i], styles);
		if (serialized.multi != null) {
			lines = lines.concat(serialized.multi.map((l) => pathPart + l));
		} else {
			lines.push(`${pathPart}: ${serialized}`);
		}
	}
	if (l < arr.length) {
		lines.push(
			`${styles.number(`[${l} - ${arr.length - 1}]`)}: ${styles.null('[OMITTED]')}`,
		);
	}
	return {
		multi: lines,
	};
};

const serializeSet = (set, styles) => {
	let lines = [`: ${styles.instance('new Set')} // size ${set.values.length}`];
	let arr = set.values;
	let l = Math.min(arr.length, styles.maxArrayItemsToDisplay);

	if (l + 1 === arr.length) {
		l++;
	}
	for (let i = 0; i < l; i++) {
		let pathPart = styles.number(`[${i}]`);

		let serialized = serializeValue(arr[i], styles);
		if (serialized.multi != null) {
			lines = lines.concat(serialized.multi.map((l) => pathPart + l));
		} else {
			lines.push(`${pathPart}: ${serialized}`);
		}
	}
	if (l < arr.length) {
		lines.push(
			`${styles.number(`[${l} - ${arr.length - 1}]`)}: ${styles.null('[OMITTED]')}`,
		);
	}
	return {
		multi: lines,
	};
};

const serializeMap = (map, styles) => {
	let lines = [`: ${styles.instance('new Map')} // size ${map.entries.length}`];
	let arr = map.entries;
	let l = Math.min(arr.length, styles.maxArrayItemsToDisplay);

	if (l + 1 === arr.length) {
		l++;
	}
	for (let i = 0; i < l; i++) {
		let pair = arr[i];
		let serK = serializeValue(pair[0], styles);
		if (serK.multi) {
			let kPathPart = `${styles.number(`[${i}]`)}.k`;
			let vPathPart = `${styles.number(`[${i}]`)}.v`;

			lines = lines.concat(serK.multi.map((l) => kPathPart + l));
			let serV = serializeValue(pair[1], styles);
			if (serV.multi != null) {
				lines = lines.concat(serV.multi.map((l) => vPathPart + l));
			} else {
				lines.push(`${vPathPart}: ${serV}`);
			}
		} else {
			let pathPart = `.set(${serK})`;
			let serV = serializeValue(pair[1], styles);
			if (serV.multi != null) {
				lines = lines.concat(serV.multi.map((l) => pathPart + l));
			} else {
				lines.push(`${pathPart}: ${serV}`);
			}
		}
	}
	if (l < arr.length) {
		lines.push(
			`${styles.number(`[${l} - ${arr.length - 1}]`)}: ${styles.null('[OMITTED]')}`,
		);
	}
	return {
		multi: lines,
	};
};

const serializeObject = (obj, styles, selfValue, keys) => {
	if (keys === undefined) {
		keys = Object.keys(obj);
	}
	let lines = [];
	if (selfValue !== undefined) {
		lines.push(`: ${selfValue}`);
	}
	for (let k of keys) {
		let v = obj[k];
		if (v !== undefined) {
			let pathPart;
			if (reIdent.test(k)) {
				pathPart = styles.field(`.${k}`);
			} else {
				pathPart = styles.string(`[${escapeString(k)}]`);
			}

			let serialized = serializeValue(v, styles);
			if (serialized.multi != null) {
				lines = lines.concat(serialized.multi.map((l) => pathPart + l));
			} else {
				lines.push(`${pathPart}: ${serialized}`);
			}
		}
	}
	if (lines.length === 0) {
		return '{}';
	}
	return {
		multi: lines,
	};
};

const serializeValue = (v, styles) => {
	let str;
	switch (typeof v) {
		case 'string':
			return styles.string(escapeString(v)); //TODO cut long strings, configure
		case 'number':
			return styles.number(`${v}`);
		case 'bigint':
		case 'boolean':
			return styles.number(v ? 'true' : 'false');
		case 'object': {
			if (v === null) {
				return styles.null('null');
			}
			if (Array.isArray(v)) return serializeArray(v, styles);
			let t = v.$t;
			switch (v.$t) {
				case 'bigint': {
					let bigint = BigInt(v.v);
					return styles.number(`${bigint.toString(10)}n`);
				}
				case 'symbol': {
					return `Symbol(${escapeString(v.desc)})`;
				}
				case 'date': {
					return `new Date(${escapeString(new Date(v.t).toISOString())})`;
				}
				case 'undefined': {
					return styles.undefined('undefined');
				}
				case 'inst': {
					let keys = Object.keys(v).filter((v) => v !== '$n' && v !== '$t');
					return serializeObject(
						v,
						styles,
						styles.instance(`new ${v.$n}`),
						keys,
					);
				}
				case 'ref': {
					return styles.reference(`= ${styles.field(v.path)}`);
				}
				case 'set': {
					return serializeSet(v, styles);
				}
				case 'map': {
					return serializeMap(v, styles);
				}
				case 'regexp': {
					return styles.regexp(
						`/${v.source}${v.flags === undefined ? '/' : `/${v.flags}`}`,
					);
				}
				default:
					return serializeObject(v, styles);
			}
		}
		case 'symbol':
			return (
				styles.null('Symbol(') +
				styles.string(escapeString(v.description)) +
				styles.null(')')
			);
		default:
			return styles.null('null');
	}
};

export const prettyPrint = (json, styles) => {
	let res = serializeValue(json, styles, 0);
	return res.multi ?? [res];
};

let noop = (v) => v;

export const NO_STYLES = {
	string: noop,
	number: noop,
	boolean: noop,
	null: noop,
	undefined: noop,
	field: noop,
	maxArrayItemsToDisplay: 15,
	instance: noop,
	reference: noop,
	regexp: noop,
	colorTag: noop,
	colorLineByLevel: new Map([
		['trace', (date, line) => `${date} TRACE ${line}`],
		['debug', (date, line) => `${date} DEBUG ${line}`],
		['info', (date, line) => `${date} INFO  ${line}`],
		['warn', (date, line) => `${date} WARN  ${line}`],
		['error', (date, line) => `${date} ERROR ${line}`],
	]),
};

const chalk = new Chalk({ level: 1 });

export const COLOR_STYLES = {
	string: chalk.yellow,
	number: chalk.blue,
	boolean: chalk.blue,
	null: chalk.magenta,
	undefined: chalk.magenta,
	field: chalk.cyan,
	maxArrayItemsToDisplay: 15,
	instance: chalk.magenta,
	reference: chalk.bgBlackBright,
	regexp: chalk.magenta,
	colorTag: chalk.green,
	colorLineByLevel: new Map([
		['trace', (date, line) => chalk.yellow(`${date} TRACE ${line}`)],
		['debug', (date, line) => `${date} DEBUG ${line}`],
		['info', (date, line) => `${date} INFO  ${line}`],
		['warn', (date, line) => chalk.red(`${date} WARN  ${line}`)],
		[
			'error',
			(date, line) =>
				chalk.red(`${date} ${chalk.black.bgRed('ERROR')} ${line}`),
		],
	]),
};

export const prettyPrintLine = (time, level, tag, msg, json, styles) => {
	let fullMesssage = (tag ? `${styles.colorTag(`[${tag}]`)} ` : '') + msg;
	let date = new Date(time).toISOString();
	let line = styles.colorLineByLevel.get(level)(date, fullMesssage);
	let prettyLines = json === undefined ? [] : prettyPrint(json, styles);

	if (prettyLines.length === 0) {
		line += '\n';
	} else {
		let prefix = '\n\t';
		for (let l of prettyLines) {
			line += prefix;
			line += l;
		}
		line += '\n';
	}
	return line;
};
