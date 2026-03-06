const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

