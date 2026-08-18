const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, connectDB } = require('./config/db');
const httpStatus = require('./utils/httpStatus');
require('./models/Registration');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Event Registration System API');
});

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    status: httpStatus.FAIL,
    message: 'This resource is not available',
  });
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.statusText = err.statusText || httpStatus.ERROR;
  res.status(err.statusCode).json({
    status: err.statusText,
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Database sync warning:', error.message);
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
