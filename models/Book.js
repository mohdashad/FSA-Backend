const mongoose = require('mongoose');
const Request = require('../models/Request'); // Adjust the path based on your directory structure

const bookSchema = new mongoose.Schema({
  BookID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Auto-generate ID
    unique: true,
  },
  Title: {
    type: String,
    required: true,
  },
  Author: {
    type: String,
    required: true,
  },
  Genre: {
    type: String,
  },
  PublishedYear: {
    type: Number,
  },
  IsAvailable: {
    type: Boolean,
    default: true,
  },
  OwnerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true,
  },
  Requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }] // Reference to ExchangeRequest
});


// Pre-delete middleware
bookSchema.pre('remove', async function (next) {
  try {
    // Delete associated exchange requests
    await Request.deleteMany({ BookID: this._id });

    // Delete associated transactions
    await Transaction.deleteMany({ RequestID: { $in: this._id } });
       next(); // Continue with the delete operation
  } catch (error) {
    next(error); // Pass error to Mongoose error handling
  }
});

module.exports = mongoose.model('Book', bookSchema);
