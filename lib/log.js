export class Log {
	constructor(logel, tag, levelMask) {
		this.logel = logel;
		this.tag = tag;
		this.levelMask = levelMask;
	}

	tagged(tag) {
		return this.logel.createTaggedLog(this, tag);
	}

	fatal(message, data) {
		this.logel.writeLine('error', this.tag, message, data);
	}

	error(message, data) {
		if (this.levelMask & 0b10000) {
			this.logel.writeLine('error', this.tag, message, data);
		}
	}

	warn(message, data) {
		if (this.levelMask & 0b1000) {
			this.logel.writeLine('warn', this.tag, message, data);
		}
	}

	info(message, data) {
		if (this.levelMask & 0b100) {
			this.logel.writeLine('info', this.tag, message, data);
		}
	}

	debug(message, data) {
		if (this.levelMask & 0b10) {
			this.logel.writeLine('debug', this.tag, message, data);
		}
	}

	trace(message, data) {
		if (this.levelMask & 0b1) {
			this.logel.writeLine('trace', this.tag, message, data);
		}
	}

	temp(message, data) {
		if (this.levelMask & 0b1) {
			this.logel.writeLine('trace', this.tag, message, data);
		}
	}
}
