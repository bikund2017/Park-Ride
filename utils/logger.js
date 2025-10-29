import winston from 'winston';
import config from '../config.js';

const { combine, printf, colorize, errors } = winston.format;

// Simple log format - just level and message
const simpleFormat = printf(({ level, message }) => {
  return `${level}: ${message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'info' : 'info',
  format: combine(
    errors({ stack: true })
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        simpleFormat
      )
    })
  ]
});

export default logger;
