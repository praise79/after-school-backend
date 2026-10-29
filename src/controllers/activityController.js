const { ObjectId } = require('mongodb')
const { getDB } = require('../config/db')

async function listActivities(req, res) {
  const activities = await getDB()
    .collection('activities')
    .find({ isActive: true })
    .sort({ category: 1, name: 1 })
    .toArray()

  res.json({ success: true, data: activities })
}

// getActivity retrieves a single activity by its ID, ensuring the ID is valid and the activity is active
async function getActivity(req, res) {
  const { id } = req.params
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'The activity ID is invalid.' })
  }

  const activity = await getDB().collection('activities').findOne({
    _id: new ObjectId(id),
    isActive: true,
  })

  if (!activity) return res.status(404).json({ success: false, message: 'Activity not found.' })
  return res.json({ success: true, data: activity })
}

// Export the controller functions for use in routes

module.exports = { listActivities, getActivity }
