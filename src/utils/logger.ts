import pino from 'pino';

const logLevels = {
    emerg: 80,
    alert: 70,
    crit: 60,
    error: 50,
    warn: 40,
    notice: 30,
    info: 20,
    debug: 10
};

export const logger = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
    customLevels: logLevels,
    useOnlyCustomLevels: true
});
