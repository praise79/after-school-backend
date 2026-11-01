const express = require('express')
const asyncHandler = require('../middleware/asyncHandler')
const { listLessons, getLesson, updateLessonSpace } = require('../controllers/lessonController')

const router = express.Router()

router.get('/', asyncHandler(listLessons))
router.get('/:id', asyncHandler(getLesson))
router.put('/:id', asyncHandler(updateLessonSpace))

module.exports = router
