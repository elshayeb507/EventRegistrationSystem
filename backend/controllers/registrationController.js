const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const asyncWapper = require('../middleware/asyncWapper');
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');

const registerForEvent = asyncWapper(async (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;

  const event = await Event.findByPk(eventId);
  if (!event) {
    const error = appError.create('Event not found', 404, httpStatus.FAIL);
    return next(error);
  }

  if (new Date(event.event_date) < new Date()) {
    const error = appError.create(
      'Registration closed: event date has passed',
      400,
      httpStatus.FAIL
    );
    return next(error);
  }

  const existingRegistration = await Registration.findOne({
    where: { user_id: userId, event_id: eventId, status: 'confirmed' },
  });
  if (existingRegistration) {
    const error = appError.create(
      'You are already registered for this event',
      400,
      httpStatus.FAIL
    );
    return next(error);
  }

  const confirmedCount = await Registration.count({
    where: { event_id: eventId, status: 'confirmed' },
  });
  if (confirmedCount >= event.capacity) {
    const error = appError.create('Event is fully booked', 400, httpStatus.FAIL);
    return next(error);
  }

  const newRegistration = await Registration.create({
    user_id: userId,
    event_id: eventId,
    status: 'confirmed',
  });

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: { registration: newRegistration },
  });
});

const cancelRegistration = asyncWapper(async (req, res, next) => {
  const registrationId = req.params.id;
  const userId = req.user.id;

  const registration = await Registration.findByPk(registrationId);

  if (!registration) {
    const error = appError.create('Registration not found', 404, httpStatus.FAIL);
    return next(error);
  }

  if (registration.user_id !== userId) {
    const error = appError.create(
      'You can only cancel your own registration',
      403,
      httpStatus.FAIL
    );
    return next(error);
  }

  registration.status = 'cancelled';
  await registration.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: 'Registration cancelled successfully',
  });
});

const getMyRegistrations = asyncWapper(async (req, res, next) => {
  const userId = req.user.id;

  const registrations = await Registration.findAll({
    where: { user_id: userId },
    include: Event,
  });

  res.status(200).json({ status: httpStatus.SUCCESS, data: { registrations } });
});

const getEventRegistrations = asyncWapper(async (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;

  const event = await Event.findByPk(eventId);
  if (!event) {
    const error = appError.create('Event not found', 404, httpStatus.FAIL);
    return next(error);
  }

  if (event.organizer_id !== userId) {
    const error = appError.create(
      'Access denied: You can only view registrations for your own events',
      403,
      httpStatus.FAIL
    );
    return next(error);
  }

  const registrations = await Registration.findAll({
    where: { event_id: eventId },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'email'],
      },
    ],
    order: [['registered_at', 'DESC']],
  });

  res.status(200).json({ status: httpStatus.SUCCESS, data: { registrations } });
});

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
};
