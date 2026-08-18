const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Event = require('./Event');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled',),
    defaultValue: 'confirmed',
  },
}, {
  tableName: 'registrations',
  timestamps: true,
  createdAt: 'registered_at',
  updatedAt: false,
});
User.hasMany(Registration, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Registration.belongsTo(User, { foreignKey: 'user_id' });

Event.hasMany(Registration, { foreignKey: 'event_id', onDelete: 'CASCADE' });
Registration.belongsTo(Event, { foreignKey: 'event_id' });

User.hasMany(Event, { foreignKey: 'organizer_id' });
Event.belongsTo(User, { foreignKey: 'organizer_id' });


module.exports = Registration;
