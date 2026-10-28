const express = require('express')
const asyncHandler = require('../middleware/asyncHandler')
const { createBooking, getBookingByReference } = require('../controllers/bookingController')

const router = express.Router()

router.post('/', asyncHandler(createBooking))
router.get('/:reference', asyncHandler(getBookingByReference))

module.exports = router
