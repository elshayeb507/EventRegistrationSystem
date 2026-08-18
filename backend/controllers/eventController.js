const { sequelize } = require('../config/db');
const Event = require('../models/Event');
const User = require('../models/User');
const asyncWapper = require('../middleware/asyncWapper');
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');

const getAllEvents = asyncWapper(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: events } = await Event.findAndCountAll({
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM registrations WHERE registrations.event_id = Event.id AND registrations.status = 'confirmed')"
          ),
          'registeredCount',
        ],
      ],
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'email'],
      },
    ],
    limit,
    offset,
    order: [['event_date', 'ASC']],
  });

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: {
      events,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

const getEventById = asyncWapper(async (req, res, next) => {
  const event = await Event.findByPk(req.params.id, {
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM registrations WHERE registrations.event_id = Event.id AND registrations.status = 'confirmed')"
          ),
          'registeredCount',
        ],
      ],
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!event) {
    const error = appError.create('Event not found', 404, httpStatus.FAIL);
    return next(error);
  }

  res.status(200).json({ status: httpStatus.SUCCESS, data: { event } });
});

const getMyEvents = asyncWapper(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: events } = await Event.findAndCountAll({
    where: { organizer_id: req.user.id },
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM registrations WHERE registrations.event_id = Event.id AND registrations.status = 'confirmed')"
          ),
          'registeredCount',
        ],
      ],
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'email'],
      },
    ],
    limit,
    offset,
    order: [['event_date', 'ASC']],
  });

  const allMyEvents = await Event.findAll({
    where: { organizer_id: req.user.id },
    attributes: [
      'id',
      'event_date',
      'capacity',
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM registrations WHERE registrations.event_id = Event.id AND registrations.status = 'confirmed')"
        ),
        'registeredCount',
      ],
    ],
  });

  const now = new Date();
  let upcomingEvents = 0;
  let pastEvents = 0;
  let totalCapacity = 0;
  let totalRegistered = 0;

  allMyEvents.forEach((ev) => {
    const regCount = Number(ev.getDataValue('registeredCount') || 0);
    totalCapacity += ev.capacity || 0;
    totalRegistered += regCount;
    if (new Date(ev.event_date) >= now) {
      upcomingEvents++;
    } else {
      pastEvents++;
    }
  });

  const totalRemaining = Math.max(0, totalCapacity - totalRegistered);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: {
      events,
      stats: {
        totalEvents: count,
        upcomingEvents,
        pastEvents,
        totalCapacity,
        totalRegistered,
        totalRemaining,
      },
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

const createEvent = asyncWapper(async (req, res, next) => {
  const { title, description, location, event_date, capacity } = req.body;

  if (!title || !event_date || !capacity) {
    const error = appError.create('Missing required fields', 400, httpStatus.FAIL);
    return next(error);
  }

  const parsedDate = new Date(event_date);
  if (isNaN(parsedDate.getTime())) {
    const error = appError.create('Invalid event date', 400, httpStatus.FAIL);
    return next(error);
  }

  if (parsedDate < new Date()) {
    const error = appError.create('Event date must be in the future', 400, httpStatus.FAIL);
    return next(error);
  }

  if (!Number.isInteger(capacity) || capacity <= 0) {
    const error = appError.create('Capacity must be a positive integer', 400, httpStatus.FAIL);
    return next(error);
  }

  const newEvent = await Event.create({
    title,
    description,
    location,
    event_date,
    capacity,
    organizer_id: req.user.id,
  });

  res.status(201).json({ status: httpStatus.SUCCESS, data: { event: newEvent } });
});

const updateEvent = asyncWapper(async (req, res, next) => {
  const event = await Event.findByPk(req.params.id);

  if (!event) {
    const error = appError.create('Event not found', 404, httpStatus.FAIL);
    return next(error);
  }

  if (event.organizer_id !== req.user.id) {
    const error = appError.create('You can only edit your own events', 403, httpStatus.FAIL);
    return next(error);
  }

  const { title, description, location, event_date, capacity } = req.body;
  if (event_date) {
    const parsedDate = new Date(event_date);
    if (isNaN(parsedDate.getTime())) {
      const error = appError.create('Invalid event date', 400, httpStatus.FAIL);
      return next(error);
    }
    if (parsedDate < new Date()) {
      const error = appError.create('Event date must be in the future', 400, httpStatus.FAIL);
      return next(error);
    }
  }

  if (capacity !== undefined && (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0)) {
    const error = appError.create('Capacity must be a positive integer', 400, httpStatus.FAIL);
    return next(error);
  }

  await event.update({
    title: title ?? event.title,
    description: description ?? event.description,
    location: location ?? event.location,
    event_date: event_date ?? event.event_date,
    capacity: capacity ? Number(capacity) : event.capacity,
  });

  res.status(200).json({ status: httpStatus.SUCCESS, data: { event } });
});

const deleteEvent = asyncWapper(async (req, res, next) => {
  const event = await Event.findByPk(req.params.id);

  if (!event) {
    const error = appError.create('Event not found', 404, httpStatus.FAIL);
    return next(error);
  }

  if (event.organizer_id !== req.user.id) {
    const error = appError.create('You can only delete your own events', 403, httpStatus.FAIL);
    return next(error);
  }

  await event.destroy();

  res.status(200).json({ status: httpStatus.SUCCESS, message: 'Event deleted successfully' });
});

module.exports = {
  getAllEvents,
  getEventById,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
