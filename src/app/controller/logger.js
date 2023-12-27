const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger, format, transports } = require('winston');
const getCustomFormat = (param) => {
    const arr = [
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.splat(),
        format.printf((info) => {
            const msg = info.message;
            const requestId = info.message?.requestId;
            return requestId
                ? `${info.timestamp} ${info.level}: [${requestId}] ${msg}`
                : `${info.timestamp} ${info.level}: ${msg}`;
        }),
    ];
    if (param) {
        arr.unshift(param);
    }
    return format.combine(...arr);
};
const customFormat = getCustomFormat();
const defaultOptions = {
    format: customFormat,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxFiles: '2d',
};

const logger = createLogger({
    exitOnError: false,
    format: format.json(),
    transports: [
        new transports.DailyRotateFile({
            filename: 'info-%DATE%.log',
            dirname: './logs',
            level: 'info',
            ...defaultOptions,
        }),
        new transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            dirname: './logs',
            level: 'error',
            ...defaultOptions,
            datePattern: 'YYYY-MM-DD',
        }),
    ],
});
logger.add(
    new winston.transports.Console({
        format: getCustomFormat(format.colorize()),
    }),
);
module.exports = logger;