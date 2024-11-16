const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  NotificationID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Auto-generate ID
    unique: true,
  },
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true,
  },
  Message: {
    type: String,
    required: true,
  },
  Type: {
    type: String,
    enum: ['Exchange Status Update', 'System Notification'], // Add more types as needed
    required: true,
  },
  Timestamp: {
    type: Date,
    default: Date.now,
  },
  IsRead: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
