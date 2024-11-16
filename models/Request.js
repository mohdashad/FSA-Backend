const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  RequestID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Auto-generate ID
    unique: true,
  },
  RequestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  RequestedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  BookID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  RequestDate: {
    type: Date,
    default: Date.now,
  },
  Status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Modified'],
    default: 'Pending',
  },
  DeliveryMethod: {
    type: String,
    enum: ['In-person', 'Shipping'],
    required: true,
  },
  Duration: {
    type: Number, // Assuming duration is in days; adjust type if needed
    required: true,
  },
  NegotiatedTerms: {
    type: String,
    default: '',
  },
});


// Pre-delete middleware
requestSchema.pre('remove', async function (next) {
  try {
        // Delete associated transactions
    await Transaction.deleteMany({ RequestID: this._id } );
       next(); // Continue with the delete operation
  } catch (error) {
    next(error); // Pass error to Mongoose error handling
  }
});

module.exports = mongoose.model('Request', requestSchema);
