export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      message: err.message,
      status: 400,
    });
  }

  if (err instanceof Error) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      message: err.message,
      status: 400,
    });
  }

  return res.status(500).json({
    timestamp: new Date().toISOString(),
    message: 'An unexpected error occurred',
    status: 500,
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
