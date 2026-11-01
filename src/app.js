const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const { rateLimit } = require('express-rate-limit')
const activityRoutes = require('./routes/activityRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const lessonRoutes = require('./routes/lessonRoutes')
const orderRoutes = require('./routes/orderRoutes')
const requestLogger = require('./middleware/requestLogger')
const { enrolment } = require('./controllers/lessonController')
const asyncHandler = require('./middleware/asyncHandler')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler')

function allowedOrigins() {
  const clientUrl = process.env.CLIENT_URL
  if (clientUrl) {
    return clientUrl.split(',').map((url) => url.trim()).filter(Boolean).map((url) => {
      try { return new URL(url).origin } catch { return url.replace(/\/$/, '') }
    })
  }
  return process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']
}

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include health checks and non-browser API clients.
    if (!origin || allowedOrigins().includes(origin)) return callback(null, true)
    const error = new Error('This origin is not allowed by the CORS policy.')
    error.status = 403
    return callback(error)
  },
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}))
app.use(express.json({ limit: '20kb' }))
app.use(requestLogger)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
}))

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})
app.use('/api/activities', activityRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/lessons', lessonRoutes)
app.use('/order', orderRoutes)
app.get('/enrolment/:lessonid', asyncHandler(enrolment))

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
