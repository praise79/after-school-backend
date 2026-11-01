const express = require('express')
const asyncHandler = require('../middleware/asyncHandler')
const { listActivities, getActivity } = require('../controllers/activityController')

const router = express.Router()

// @desc    Get all activities
// @route   GET /api/activities
// @access  Public

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Public
router.get('/', asyncHandler(listActivities))
router.get('/:id', asyncHandler(getActivity))

module.exports = router
