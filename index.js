import { Log } from './lib/log.js';
import {
	LOGEL_DEFAULT_DUMP,
	Logel,
	createDefaultLogel,
	outputRegistry,
} from './lib/logel.js';

const logel = createDefaultLogel();
const log = logel.log();
export { Log, Logel, log, logel, outputRegistry, LOGEL_DEFAULT_DUMP };

// module.exports = {
//   Logel: require('./lib/logel'),
//   Log: require('./lib/log'),
// };
