const express = require('express')
const asyncHandler = require('../middleware/asyncHandler')
const { createOrder } = require('../controllers/orderController')

const router = express.Router()

router.post('/', asyncHandler(createOrder))

module.exports = router
