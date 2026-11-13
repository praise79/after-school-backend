const { ObjectId } = require('mongodb')
const { getDB } = require('../config/db')

const namePattern = /^[a-zA-Z\s]+$/

function createReference() {
  return `OR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

async function createOrder(req, res) {
  const { name, phone, phoneCountry, lessonIDs, numberOfSpaces } = req.body || {}
  const ids = Array.isArray(lessonIDs) ? [...new Set(lessonIDs.map(String))] : []
  const totalSpaces = Number(numberOfSpaces || ids.length)

  if (!namePattern.test(String(name || '').trim())) {
    return res.status(400).json({ success: false, message: 'Name must contain letters and spaces only.' })
  }
  if (typeof phone !== 'string' || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Enter a valid phone number with its international country code.' })
  }
  if (typeof phoneCountry !== 'string' || !/^[A-Z]{2}$/.test(phoneCountry)) {
    return res.status(400).json({ success: false, message: 'Select a valid country.' })
  }
  if (!ids.length || !ids.every((id) => ObjectId.isValid(id))) {
    return res.status(400).json({ success: false, message: 'At least one valid lesson is required.' })
  }
  if (!Number.isInteger(totalSpaces) || totalSpaces < 1) {
    return res.status(400).json({ success: false, message: 'Number of spaces must be a positive whole number.' })
  }

  const db = getDB()
  const changed = []
  try {
    for (const id of ids) {
      const result = await db.collection('lesson').findOneAndUpdate(
        { _id: new ObjectId(id), space: { $gte: 1 } },
        { $inc: { space: -1 }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' },
      )
      if (!result) {
        const error = new Error('One of the selected lessons has no space left.')
        error.status = 409
        throw error
      }
      changed.push(id)
    }

    const order = {
      reference: createReference(),
      name: String(name).trim(),
      phone: String(phone),
      phoneCountry,
      lessonIDs: ids,
      numberOfSpaces: totalSpaces,
      createdAt: new Date(),
    }
    await db.collection('order').insertOne(order)
    return res.status(201).json({ success: true, data: { ...order, _id: order._id?.toString() } })
  } catch (error) {
    if (changed.length) {
      await db.collection('lesson').updateMany(
        { _id: { $in: changed.map((id) => new ObjectId(id)) } },
        { $inc: { space: 1 } },
      )
    }
    throw error
  }
}

module.exports = { createOrder }
