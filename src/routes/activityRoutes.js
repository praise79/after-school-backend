const express = require('express')
const asyncHandler = require('../middleware/asyncHandler')
const { listActivities, getActivity } = require('../controllers/activityController')

const router = express.Router()

router.get('/', asyncHandler(listActivities))
router.get('/:id', asyncHandler(getActivity))

module.exports = router
