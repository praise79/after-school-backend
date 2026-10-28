const { ObjectId } = require('mongodb')

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhone(value) {
  return /^[0-9+().\-\s]{7,30}$/.test(value)
}

function validateBooking(body = {}) {
  const data = {
    activityId: cleanText(body.activityId, 30),
    studentName: cleanText(body.studentName, 80),
    parentName: cleanText(body.parentName, 80),
    contactEmail: cleanText(body.contactEmail, 254).toLowerCase(),
    contactPhone: cleanText(body.contactPhone, 30),
    places: Number(body.places),
  }
  const errors = {}

  if (!ObjectId.isValid(data.activityId)) errors.activityId = 'A valid activity ID is required.'
  if (data.studentName.length < 2) errors.studentName = 'Student name must be at least 2 characters.'
  if (data.parentName.length < 2) errors.parentName = 'Parent or guardian name must be at least 2 characters.'
  if (!isValidEmail(data.contactEmail)) errors.contactEmail = 'A valid email address is required.'
  if (!isValidPhone(data.contactPhone)) errors.contactPhone = 'A valid phone number is required.'
  if (!Number.isInteger(data.places) || data.places < 1 || data.places > 8) {
    errors.places = 'Places must be a whole number between 1 and 8.'
  }

  return { data, errors, isValid: Object.keys(errors).length === 0 }
}

module.exports = { cleanText, validateBooking }
