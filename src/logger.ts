import * as winston from 'winston';
import { LOG_MESSAGES } from './constants/logMessages';

/**
 * We initialize and export an instance of a winston logger, using the default npm logging levels
 * (see https://www.npmjs.com/package/winston#logging-levels)
 *
 * All logs with a severity equal or above `error` are stored in `error.log`
 *
 * All logs with a severity equal or above the `logLevel` set by yourself (default: `verbose`)
 * are stored in `userDefinedLogging.log`
 */

const logLevel = process.env.loggingLevel || 'verbose';

const logger = winston.createLogger({
    format: winston.format.json(),
    level: logLevel,
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'userDefinedLogging.log' }),
    ],
});
logger.add(
    new winston.transports.Console({
        format: winston.format.simple(),
    }),
);
logger.warn(`${LOG_MESSAGES.initializeLogging} ${logLevel}`);

export { logger };
