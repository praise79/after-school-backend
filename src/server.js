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



async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`)
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  await closeDB()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM')) 

startServer().catch((error) => {
  console.error('Unable to start API:', error.message)
  process.exit(1)
})
