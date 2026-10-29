const crypto = require('crypto')
const { ObjectId } = require('mongodb')
const { getDB } = require('../config/db')
const { validateBooking } = require('../utils/validation')

function createReference() {
  return `BF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`
}

// createBooking function handles the creation of a new booking, ensuring that the requested number of places does not exceed the activity's capacity.
async function createBooking(req, res) {
  const { data, errors, isValid } = validateBooking(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Please correct the highlighted fields.', errors })
  }

  const db = getDB()
  const activities = db.collection('activities')
  const activityId = new ObjectId(data.activityId)

  // One atomic update prevents concurrent requests from reserving more places than capacity.
  const reservedActivity = await activities.findOneAndUpdate(
    {
      _id: activityId,
      isActive: true,
      $expr: { $lte: [{ $add: ['$placesBooked', data.places] }, '$capacity'] },
    },
    { $inc: { placesBooked: data.places }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after', includeResultMetadata: true },
  )

  if (!reservedActivity.value) {
    const existingActivity = await activities.findOne(
      { _id: activityId },
      { projection: { isActive: 1, capacity: 1, placesBooked: 1 } },
    )
    if (!existingActivity || !existingActivity.isActive) {
      return res.status(404).json({ success: false, message: 'Activity not found or unavailable.' })
    }
    return res.status(409).json({ success: false, message: 'There are not enough places available for this booking.' })
  }

  const reference = createReference()
  const booking = {
    reference,
    activityId,
    studentName: data.studentName,
    parentName: data.parentName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    places: data.places,
    totalPrice: reservedActivity.value.price * data.places,
    status: 'confirmed',
    createdAt: new Date(),
  }

  try {
    await db.collection('bookings').insertOne(booking)
  } catch (error) {
    // This API does not use transactions. Return the reserved capacity if its booking write fails.
    await activities.updateOne(
      { _id: activityId, placesBooked: { $gte: data.places } },
      { $inc: { placesBooked: -data.places }, $set: { updatedAt: new Date() } },
    )
    throw error
  }

  return res.status(201).json({ success: true, data: { reference } })
}

// getBookingByReference retrieves a booking by its reference number, ensuring the reference format is valid and the booking exists.
async function getBookingByReference(req, res) {
  const reference = String(req.params.reference || '').trim().toUpperCase()
  if (!/^BF-[A-Z0-9]+-[A-F0-9]{12}$/.test(reference)) {
    return res.status(400).json({ success: false, message: 'The booking reference is invalid.' })
  }

  const booking = await getDB().collection('bookings').findOne(
    { reference },
    { projection: { _id: 0, reference: 1, activityId: 1, places: 1, totalPrice: 1, status: 1, createdAt: 1 } },
  )
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' })

  return res.json({ success: true, data: booking })
}

module.exports = { createBooking, getBookingByReference }
