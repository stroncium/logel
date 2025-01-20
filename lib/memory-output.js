export class MemoryOutput {
	constructor() {
		this.lines = [];
	}

	writeLine(time, level, tag, msg, json) {
		this.lines.push({ time, level, tag, msg, json });
	}

	transferToOutput(output) {
		for (let line of this.lines) {
			output.writeLine(line.time, line.level, line.tag, line.msg, line.json);
		}
		this.lines = [];
	}

	async flush() {}
}
