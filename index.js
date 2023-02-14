const {
  Logel,
} = require('./lib/logel');
const {
  // renderValue,
  renderRootObject,
  LOGEL_RENDER,
  LOGEL_FINAL,
  setLogelRender,
} = require('./lib/render');

module.exports = {
  Logel,
  // renderValue,
  renderRootObject,
  LOGEL_RENDER,
  LOGEL_FINAL,
  setLogelRender,
  Log: require('./lib/log'),
};
