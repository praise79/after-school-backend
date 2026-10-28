const { MongoClient, ServerApiVersion } = require('mongodb')

let client
let database

async function connectDB() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.DB_NAME || 'after_school'

  if (!uri) throw new Error('MONGODB_URI is missing.')

  const host = getSafeHost(uri)
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })

  try {
    await client.connect()
    database = client.db(dbName)
    await database.command({ ping: 1 })
    await createIndexes(database)
  } catch (error) {
    console.error(`MongoDB connection test failed for ${host}: ${error.message}`)
    await client.close().catch(() => {})
    client = undefined
    database = undefined
    throw error
  }

  console.log(`MongoDB connection test passed: ${host}/${dbName}`)
  return database
}

function getSafeHost(uri) {
  try {
    return new URL(uri).hostname || 'MongoDB deployment'
  } catch {
    return 'MongoDB deployment'
  }
}

async function createIndexes(db) {
  await Promise.all([
    db.collection('activities').createIndex({ slug: 1 }, { unique: true }),
    db.collection('bookings').createIndex({ reference: 1 }, { unique: true }),
  ])
}

function getDB() {
  if (!database) throw new Error('Database is not connected.')
  return database
}

async function closeDB() {
  if (client) await client.close()
}

module.exports = { connectDB, getDB, closeDB }
