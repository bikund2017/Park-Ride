/* eslint-disable no-trailing-spaces */
import winston from 'winston';
import config from '../config.js';

const { combine, printf, colorize, errors } = winston.format;


const simpleFormat = printf(({ level, message }) => {
  return `${level}: ${message}`;
});


const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'info' : 'info',
  format: combine(
    errors({ stack: true })
  ),
  transports: [
   
    new winston.transports.Console({
      format: combine(
        colorize(),
        simpleFormat
      )
    })
  ]
});

export default logger;
