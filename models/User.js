const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Auto-generate ID
    unique: true,
  },
  Name: {
    type: String,
    required: true,
    trim: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address.',
    },
  },
  PasswordHash: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    trim: true,
  },
  ProfilePicture: {
    type: String, // Store URL or file path to the profile picture
    default: null,
  },
  RegistrationDate: {
    type: Date,
    default: Date.now,
  },
  ResetToken: {
    type: String, // Store token for password recovery
    default: null,
  },
  IsActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('User', userSchema);
