const { ObjectId } = require('mongodb')
const { getDB } = require('../config/db')
const { parsePhoneNumberFromString } = require('libphonenumber-js')

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
  const parsedPhone = typeof phone === 'string' ? parsePhoneNumberFromString(phone) : null
  if (!parsedPhone || !parsedPhone.isValid() || parsedPhone.number !== phone) {
    return res.status(400).json({ success: false, message: 'Enter a valid international phone number.' })
  }
  if (typeof phoneCountry !== 'string' || !/^[A-Z]{2}$/.test(phoneCountry) || parsedPhone.country !== phoneCountry) {
    return res.status(400).json({ success: false, message: 'The phone number does not match the selected country.' })
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
      phone: parsedPhone.number,
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
