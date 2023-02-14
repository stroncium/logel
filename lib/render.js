const LOGEL_RENDER = Symbol('Logel.render');
const LOGEL_FINAL = Symbol('Logel.final');

const renderValue = (v, ctx) => {
	if (v === undefined) {
		return {$type: '$undefined'};
	}
	if (v === null) {
		return null;
	}
	switch (typeof v) {
		case 'string': case 'number': return v;
		case 'bigint': return {$type: '$bigint', v: v.toString()};
		default:
			let seen = ctx.seen;
			if (seen.has(v)) {
				return {$type: '$seen'};
			}
			seen.add(v);
			let renderer = v[ctx.sym] ?? LOGEL_RENDER;
			if (renderer === renderObject) {
				return renderObject(v, ctx);
			}
			let rendered = renderer.call(v, v, ctx);
			if (rendered == null || rendered[LOGEL_FINAL]) return rendered;
			return renderValue(rendered, ctx);
	}
};

const renderObject = (o, ctx) => {
	if (o instanceof Array) {
		let res = [];
		for (let i = 0; i < o.length; i++) {
			res[i] = renderValue(o[i], ctx);
		}
		return res;
	} else {
		let res = {};
		for (let k of Object.keys(o)) {
			res[k] = renderValue(o[k], ctx)
		}
		return res;
	}
};

function setLogelRender(Class, symbol, value) {
	Object.defineProperty(Class.prototype, symbol, {
	  enumerable: false,
	  value,
	});
}

const renderRootObject = (v, sym) => {
	if (v === undefined || v === null) {
		return v;
	}
	let ctx = {
		sym,
		seen: new Set(),
	};
	return renderObject(v, ctx);
};

setLogelRender(Object, LOGEL_RENDER, renderObject);

module.exports = {
	setLogelRender,
	renderValue,
	renderRootObject,
	LOGEL_RENDER,
	LOGEL_FINAL,
};
