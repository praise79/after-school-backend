require('dotenv').config({ quiet: true })

const { connectDB, closeDB } = require('../config/db')

// Sample activities to seed into the database
const activities = [
  {
    name: 'Code Creators Club',
    slug: 'code-creators-club',
    description: 'A friendly introduction to creative coding, problem solving and building small digital projects.',
    category: 'Technology',
    minAge: 8,
    maxAge: 12,
    schedule: 'Tuesdays, 4:00–5:30 pm',
    price: 18,
    capacity: 16,
    isActive: true,
  },
  {
    name: 'Colour and Clay Studio',
    slug: 'colour-and-clay-studio',
    description: 'Children experiment with drawing, painting and clay in a relaxed, practical art session.',
    category: 'Art',
    minAge: 6,
    maxAge: 10,
    schedule: 'Wednesdays, 4:00–5:15 pm',
    price: 15,
    capacity: 14,
    isActive: true,
  },
  {
    name: 'Junior Music Makers',
    slug: 'junior-music-makers',
    description: 'Explore rhythm, song writing and simple instruments in a supportive small group.',
    category: 'Music',
    minAge: 7,
    maxAge: 11,
    schedule: 'Thursdays, 4:00–5:15 pm',
    price: 16,
    capacity: 12,
    isActive: true,
  },
  {
    name: 'Junior Sports Lab',
    slug: 'junior-sports-lab',
    description: 'Build confidence, coordination and teamwork through rotating games and movement challenges.',
    category: 'Sport',
    minAge: 7,
    maxAge: 11,
    schedule: 'Fridays, 3:45–5:00 pm',
    price: 14,
    capacity: 20,
    isActive: true,
  },
]

// Seed activities into the database without replacing existing booking totals
async function seedActivities() {
  const db = await connectDB()
  const collection = db.collection('activities')
  const now = new Date()

  for (const activity of activities) {
    await collection.updateOne(
      { slug: activity.slug },
      {
        $set: { ...activity, updatedAt: now },
        $setOnInsert: { placesBooked: 0, createdAt: now },
      },
      { upsert: true },
    )
  }

  console.log(`Seeded ${activities.length} activities without replacing existing booking totals.`)
}

// Connect to the database, seed activities, and close the database connection
seedActivities()
  .catch((error) => {
    console.error('Unable to seed activities:', error.message)
    process.exitCode = 1
  })
  .finally(() => closeDB())
