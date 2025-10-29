// Simple middleware that does nothing - logging disabled for cleaner output
const morganMiddleware = (req, res, next) => {
  next();
};

export default morganMiddleware;
