const { ObjectId } = require('mongodb')
const { getDB } = require('../config/db')

function toLesson(document) {
  if (!document) return null
  return {
    ...document,
    _id: document._id.toString(),
    id: document._id.toString(),
  }
}

function validId(value) {
  return typeof value === 'string' && ObjectId.isValid(value)
}

function sortValue(lesson, field) {
  if (field === 'subject') return String(lesson.subject || lesson.topic || '').toLowerCase()
  if (field === 'location') return String(lesson.location || '').toLowerCase()
  if (field === 'price') return Number(lesson.price) || 0
  return Number(lesson.space) || 0
}

async function listLessons(req, res) {
  const db = getDB()
  const search = String(req.query.search || '').trim().toLowerCase()
  const teacher = String(req.query.teacher || '').trim().toLowerCase()
  const sortBy = ['subject', 'location', 'price', 'space', 'spaces'].includes(req.query.sortBy)
    ? (req.query.sortBy === 'spaces' ? 'space' : req.query.sortBy)
    : 'subject'
  const direction = String(req.query.direction || 'asc').toLowerCase() === 'desc' ? -1 : 1

  const lessons = await db.collection('lesson').find({ isActive: { $ne: false } }).toArray()
  const filtered = lessons.filter((lesson) => {
    const searchText = [lesson.topic, lesson.location, lesson.price, lesson.space].join(' ').toLowerCase()
    const teacherText = [lesson.teacherFirstName, lesson.teacherLastName].join(' ').toLowerCase()
    return (!search || searchText.includes(search)) && (!teacher || teacherText.includes(teacher))
  })

  filtered.sort((left, right) => {
    const a = sortValue(left, sortBy)
    const b = sortValue(right, sortBy)
    return (a < b ? -1 : a > b ? 1 : 0) * direction
  })

  res.json({ success: true, data: filtered.map(toLesson) })
}

async function getLesson(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'The lesson ID is invalid.' })
  }

  const lesson = await getDB().collection('lesson').findOne({ _id: new ObjectId(req.params.id) })
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' })
  return res.json({ success: true, data: toLesson(lesson) })
}

async function updateLessonSpace(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'The lesson ID is invalid.' })
  }

  const space = Number(req.body.space)
  if (!Number.isInteger(space) || space < 0) {
    return res.status(400).json({ success: false, message: 'Space must be a whole number of zero or more.' })
  }

  const result = await getDB().collection('lesson').findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { space, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!result) return res.status(404).json({ success: false, message: 'Lesson not found.' })
  return res.json({ success: true, data: toLesson(result) })
}

async function enrolment(req, res) {
  if (!validId(req.params.lessonid)) {
    return res.status(400).json({ success: false, message: 'The lesson ID is invalid.' })
  }

  const lessonId = req.params.lessonid
  const orders = await getDB().collection('order').find({ lessonIDs: lessonId }).toArray()
  const numberOfSpaces = orders.reduce((total, order) => total + Number(order.numberOfSpaces || 0), 0)
  return res.json({ success: true, data: { lessonId, numberOfSpaces } })
}

module.exports = { listLessons, getLesson, updateLessonSpace, enrolment }
