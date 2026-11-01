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
    currency: 'USD',
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
    currency: 'USD',
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
    currency: 'USD',
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
    currency: 'USD',
    capacity: 20,
    isActive: true,
  },
  {
    name: 'Little Gardeners',
    slug: 'little-gardeners',
    description: 'Plant, care for and learn about seasonal growing through hands-on garden activities.',
    category: 'Nature',
    minAge: 6,
    maxAge: 10,
    schedule: 'Mondays, 4:00 to 5:15 pm',
    price: 13,
    currency: 'USD',
    capacity: 12,
    isActive: true,
  },
  {
    name: 'Story Makers',
    slug: 'story-makers',
    description: 'Turn bright ideas into characters, scenes and short stories with playful writing prompts.',
    category: 'Writing',
    minAge: 8,
    maxAge: 12,
    schedule: 'Tuesdays, 4:00 to 5:15 pm',
    price: 14,
    currency: 'USD',
    capacity: 14,
    isActive: true,
  },
  {
    name: 'Build and Tinker Lab',
    slug: 'build-and-tinker-lab',
    description: 'Design, test and improve clever builds using everyday materials and simple mechanisms.',
    category: 'Making',
    minAge: 8,
    maxAge: 12,
    schedule: 'Thursdays, 4:00 to 5:30 pm',
    price: 17,
    currency: 'USD',
    capacity: 16,
    isActive: true,
  },
]

const lessons = [
  { topic: 'Code Creators Club', subject: 'Technology', location: 'Main lab', price: 18000, currency: 'USD', space: 9, teacherFirstName: 'Ava', teacherLastName: 'Bello', image: '/images/lesson.svg' },
  { topic: 'Colour and Clay Studio', subject: 'Art', location: 'Art room', price: 10000, currency: 'USD', space: 10, teacherFirstName: 'Tola', teacherLastName: 'Adeyemi', image: '/images/lesson.svg' },
  { topic: 'Junior Sports Lab', subject: 'Sport', location: 'Sports hall', price: 12000, currency: 'USD', space: 9, teacherFirstName: 'Musa', teacherLastName: 'Okafor', image: '/images/lesson.svg' },
  { topic: 'Junior Music Makers', subject: 'Music', location: 'Music room', price: 14000, currency: 'USD', space: 9, teacherFirstName: 'Zara', teacherLastName: 'Ibrahim', image: '/images/lesson.svg' },
  { topic: 'Little Gardeners', subject: 'Nature', location: 'School garden', price: 9000, currency: 'USD', space: 7, teacherFirstName: 'Chidi', teacherLastName: 'Okoro', image: '/images/lesson.svg' },
  { topic: 'Story Makers', subject: 'Writing', location: 'Library', price: 11000, currency: 'USD', space: 8, teacherFirstName: 'Amaka', teacherLastName: 'Yusuf', image: '/images/lesson.svg' },
  { topic: 'Build and Tinker Lab', subject: 'Making', location: 'Design lab', price: 15000, currency: 'USD', space: 8, teacherFirstName: 'Daniel', teacherLastName: 'Obi', image: '/images/lesson.svg' },
  { topic: 'Young Chefs Kitchen', subject: 'Cooking', location: 'Food lab', price: 16000, currency: 'USD', space: 8, teacherFirstName: 'Fatima', teacherLastName: 'Bello', image: '/images/lesson.svg' },
  { topic: 'Dance and Movement', subject: 'Dance', location: 'Dance studio', price: 13000, currency: 'USD', space: 10, teacherFirstName: 'Grace', teacherLastName: 'Eze', image: '/images/lesson.svg' },
  { topic: 'Photo Explorers', subject: 'Media', location: 'Media room', price: 17000, currency: 'USD', space: 6, teacherFirstName: 'Kene', teacherLastName: 'Nwosu', image: '/images/lesson.svg' },
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

  const lessonsCollection = db.collection('lesson')
  for (const lesson of lessons) {
    await lessonsCollection.updateOne(
      { topic: lesson.topic },
      { $set: { ...lesson, isActive: true, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    )
  }

  console.log(`Seeded ${lessons.length} lessons in the lesson collection.`)
}

// Connect to the database, seed activities, and close the database connection
seedActivities()
  .catch((error) => {
    console.error('Unable to seed activities:', error.message)
    process.exitCode = 1
  })
  .finally(() => closeDB())
