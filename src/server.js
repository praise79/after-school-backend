require('dotenv').config()

const app = require('./app')
const { connectDB, closeDB } = require('./config/db')

const port = Number(process.env.PORT) || 5000
let server


// startServer starts the server and connects to the database
async function startServer() {
  await connectDB()
  server = app.listen(port, () => console.log(`API listening on port ${port}`))
}

// shutdown gracefully shuts down the server and closes the database connection
async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`)
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  await closeDB()
  process.exit(0)
}

// Handle termination signals for graceful shutdown
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM')) 

// Start the server
startServer().catch((error) => {
  console.error('Unable to start API:', error.message)
  process.exit(1)
})
