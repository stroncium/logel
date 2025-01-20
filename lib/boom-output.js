import SonicBoom from 'sonic-boom';
import { COLOR_STYLES, NO_STYLES, prettyPrintLine } from './pretty-print.js';

const boolish = (str, emptyValue) => {
	if (str === undefined || str === null) {
		return undefined;
	}
	switch (str.toLowerCase()) {
		case '1':
		case 'y':
		case 'yes':
		case 'true':
		case 't':
			return true;
		case '0':
		case 'n':
		case 'no':
		case 'false':
		case 'f':
			return false;
		case '':
			return emptyValue;
		default:
			throw new Error('unknown value');
	}
};

export class BoomOutput {
	constructor(boom, sync) {
		this.boom = boom;
		if (!sync) {
			process.on('exit', () => {
				this.boom.flushSync();
			});
		}
	}

	static parseCommonOptsFromUrl(url) {
		let sync = boolish(url.searchParams.get('sync'), true) ?? false;
		let color = boolish(url.searchParams.get('color'), true) ?? false;
		let pretty = boolish(url.searchParams.get('pretty'), true) ?? false;
		let fsync = boolish(url.searchParams.get('fsync'), true) ?? false;
		let periodicFlush = 10000;
		let periodicFlushStr = url.searchParams.get('periodicFlush') ?? undefined;
		if (periodicFlushStr !== undefined) {
			periodicFlush = Number.parseInt(periodicFlushStr, 10);
			if (`${periodicFlush}` !== periodicFlushStr || periodicFlush <= 0) {
				throw new Error('invalid periodicFlush value');
			}
		}
		return {
			sync,
			color,
			pretty,
			fsync,
			periodicFlush,
		};
	}

	static createFd(fd, url) {
		return BoomOutput.create(url, { fd });
	}

	static createFile(dest, url) {
		return BoomOutput.create(url, { dest });
	}

	static create(url, destOpts) {
		let opts = BoomOutput.parseCommonOptsFromUrl(url);
		let sync = opts.sync;
		let boom = new SonicBoom({
			...destOpts,
			...opts,
			minLength: sync ? 0 : 4096,
			// retryEAGAIN(err, writeBufferLen, remainingBufferLen): a function that will be called when sonic-boom write/writeSync/flushSync encounters a EAGAIN or EBUSY error. If the return value is true sonic-boom will retry the operation, otherwise it will bubble the error. err is the error that caused this function to be called, writeBufferLen is the length of the buffer sonic-boom tried to write, and remainingBufferLen is the length of the remaining buffer sonic-boom didn't try to write.
		});
		if (opts.pretty) {
			return new BoomOutputPretty(boom, sync, opts.color);
		}
		return new BoomOutputSimple(boom, sync);
	}
}

class BoomOutputSimple extends BoomOutput {
	writeLine(time, level, tag, msg, json) {
		let line = `{"$t":${time}, "$l":${JSON.stringify(level)}`;
		if (tag !== undefined) {
			line += `, "$tag":${JSON.stringify(tag)}`;
		}
		line += `, "$m":${JSON.stringify(msg)}`;
		if (json !== undefined) {
			line += `, "$d":${json}`;
		}
		line += '}\n';
		this.boom.write(line);
	}
}

// import {Chalk} from 'chalk';
class BoomOutputPretty extends BoomOutput {
	constructor(boom, sync, color) {
		super(boom, sync);
		if (color) {
			this.styles = COLOR_STYLES;
		} else {
			this.styles = NO_STYLES;
		}
	}

	writeLine(time, level, tag, msg, json) {
		this.boom.write(
			prettyPrintLine(
				time,
				level,
				tag,
				msg,
				json === undefined ? undefined : JSON.parse(json),
				this.styles,
			),
		);
	}

	async flush() {
		await this.boom.flush();
	}
}
