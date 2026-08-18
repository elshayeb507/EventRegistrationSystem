const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { getEventRegistrations } = require('../controllers/registrationController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(eventController.getAllEvents)
  .post(protect, organizerOnly, eventController.createEvent);

router.get('/my', protect, organizerOnly, eventController.getMyEvents);

router.get('/:eventId/registrations', protect, organizerOnly, getEventRegistrations);

router.route('/:id')
  .get(eventController.getEventById)
  .put(protect, organizerOnly, eventController.updateEvent)
  .delete(protect, organizerOnly, eventController.deleteEvent);

module.exports = router;