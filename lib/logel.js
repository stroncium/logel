import { BoomOutput } from './boom-output.js';
import { encodeJsondump } from './jsondump.js';
import { Log } from './log.js';
import { MemoryOutput } from './memory-output.js';

export class OutputRegistry {
	constructor(entries) {
		this.map = new Map(entries);
	}

	register(name, createOutput) {
		this.map.set(name, createOutput);
	}

	async startOutput(urlText, log) {
		let url = URL.parse(urlText);
		let name = url.protocol.substr(0, url.protocol.length - 1);
		let creator = this.map.get(name);
		if (creator === undefined) {
			throw new Error(`unknown output type (${name})`);
		}
		return await creator(url, log);
	}
}

export const outputRegistry = new OutputRegistry([
	[
		'memory',
		() => {
			return new MemoryOutput();
		},
	],
	[
		'std',
		(url) => {
			let fd;
			switch (url.host) {
				case 'out': {
					fd = 1;
					break;
				}
				case 'err': {
					fd = 2;
					break;
				}
				default: {
					throw new Error(`unknown std output ${url.host} in ${url.href}`);
				}
			}
			return BoomOutput.createFd(fd, url);
		},
	],
	[
		'fd',
		(url) => {
			let fd = Number.parseInt(url.pathname);
			if (`${fd}` !== url.pathname) {
				throw new Error('incorrect fd');
			}
			return BoomOutput.createFd(fd, url);
		},
	],
	[
		'file',
		(url) => {
			return BoomOutput.createFile(url.pathname, url);
		},
	],
]);

export const LOGEL_DEFAULT_DUMP = Symbol('Logel default dump');
export class Logel {
	constructor(outputCandidates, dump, dump2) {
		this.dump = dump ?? LOGEL_DEFAULT_DUMP;
		this.dump2 = dump2 ?? LOGEL_DEFAULT_DUMP;
		this.temporaryOutput = new MemoryOutput();
		this.output = this.temporaryOutput;
		this.selfLog = new Log(this, 'logel', 0b11111);
		this.outputCandidates = outputCandidates;
		this.outputOpen = false;

		this.writeLine = this.writeFirstLine;
	}

	log() {
		return new Log(this, undefined, 0b11111);
	}

	createTaggedLog(log, tag) {
		let childTag = log.tag == null ? tag : `${log.tag}.${tag}`;
		return new Log(this, childTag, 0b11111);
	}

	writeFirstLine(level, tag, msg, data) {
		this.startOpenOutput();
		this.writeLine = this.writeNextLine;
		this.writeLine(level, tag, msg, data);
	}

	writeNextLine(level, tag, msg, data) {
		let time = Date.now();
		let json =
			data === undefined
				? undefined
				: encodeJsondump(data, this.dump, this.dump2);
		this.output.writeLine(time, level, tag, msg, json);
	}

	startOpenOutput() {
		if (this.startOutputPromise === undefined) {
			this.startOutputPromise = this.openOutput();
		}
		return this.startOutputPromise;
	}

	async openOutput() {
		let output;
		for (let c of this.outputCandidates) {
			try {
				output = await outputRegistry.startOutput(c, this.selfLog);
				break;
			} catch (err) {
				this.selfLog.error('failed to start output', { candidate: c, err });
			}
		}
		if (output === undefined) {
			if (this.temporaryOutput.lines.length > 0) {
				console.warn('have pending lines in temporary output');
				for (let l of this.temporaryOutput.lines) {
					console.warn(l);
				}
			}
			throw new Error('failed to start any output');
		}
		this.setOutput(output);
	}

	setOutput(output) {
		this.output = output;
		if (output !== this.temporaryOutput) {
			this.temporaryOutput.transferToOutput(output);
		}
		this.temporaryOutput = undefined;
		this.outputOpen = true;
		this.writeLine = this.writeNextLine;
	}

	async ensureOpenOutput() {
		if (this.outputOpen) {
			return;
		}
		if (this.startOutputPromise !== undefined) {
			return this.startOpenOutput;
		}
		await this.startOpenOutput;
	}

	async flush() {
		await this.ensureOpenOutput();
		await this.output.flush();
	}

	static createMemoryLogel(dump, dump2) {
		let logel = new Logel([], dump, dump2);
		logel.setOutput(logel.temporaryOutput);
		return logel;
	}
}

export const createDefaultLogel = () => {
	const looksLikeK8s = () => {
		return process.env.KUBERNETES_SERVICE_HOST !== undefined;
	};

	const hasDockerCgroups = () => {
		try {
			return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
		} catch {
			return false;
		}
	};

	const hasDockerEnv = () => {
		try {
			fs.statSync('/.dockerenv');
			return true;
		} catch {
			return false;
		}
	};

	let candidates;
	let preferNonpretty = looksLikeK8s() || hasDockerCgroups() || hasDockerEnv();
	if (
		process.env.LOGEL_OUT !== undefined &&
		process.env.LOGEL_OUT.trim() !== ''
	) {
		candidates = process.env.LOGEL_OUT.split(',').map((v) => v.trim());
	} else {
		candidates = [
			preferNonpretty ? 'std://out?sync' : 'std://out?pretty&color',
		];
	}
	if (candidates.find((v) => v.startsWith('std://err') === undefined)) {
		candidates.push(preferNonpretty ? 'std://err' : 'std://err?pretty&color');
	}

	return new Logel(candidates, LOGEL_DEFAULT_DUMP);
};
