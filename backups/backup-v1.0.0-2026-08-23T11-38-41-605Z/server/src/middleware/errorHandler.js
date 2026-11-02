const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join('. ');
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}. Please use another value.`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID.';
  }

  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal Server Error' : message
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack
    });
  }
};

module.exports = errorHandler;
