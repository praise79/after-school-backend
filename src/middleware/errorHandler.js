function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  const status = error.statusCode || error.status || 500
  const isProduction = process.env.NODE_ENV === 'production'

  if (status >= 500) console.error(error)

  res.status(status).json({
    success: false,
    message: status >= 500 && isProduction ? 'An unexpected server error occurred.' : error.message || 'An unexpected server error occurred.',
  })
}

module.exports = { notFoundHandler, errorHandler }
