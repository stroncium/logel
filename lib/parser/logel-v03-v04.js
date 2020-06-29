const LEVELS = require('../levels');

const parseLogelV03V04Line = line => {
	try {
		let json = JSON.parse(line);
		let level = LEVELS[json.$level];
		if (typeof json.$time === 'number' && level !== undefined && typeof json.$message === 'string') {
			let context;
			for (let [k, v] of Object.entries(json)) {
				if (k !== '$time' && k !== '$level' && k != '$tag' && k != '$message') {
					if (context === undefined) {
						context = {};
					}
					context[k] = v;
				}
			}
			return {
				time: json.$time,
				level,
				tag: json.$tag,
				message: json.$message,
				context,
			};
		}
		if (typeof json.t === 'number' && typeof json.l === 'number' && typeof json.m === 'string') {
			return {
				time: json.t,
				level: json.l,
				message: json.m,
				tag: json.g,
				context: json.c,
			};
		}
	} catch (err) {
		return undefined;
	}
};

module.exports = {
	parseLogelV03V04Line,
};