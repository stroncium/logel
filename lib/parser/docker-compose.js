const parseDockerComposeLine = srcLine => {
	let idx = srcLine.indexOf('|');

	if (idx === -1) {
		return undefined;
	}

  let line = srcLine.substr(idx+1);
  let source = srcLine.substr(0, idx).trim();

	return {
		source,
		line,
	};
};

module.exports = {
	parseDockerComposeLine,
};