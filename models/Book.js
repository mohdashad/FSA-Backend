// models/User.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  summary: { type: String, required: true },  // Add password field
  category: { type: String, required: true },  // Add password field
  isListed: { type: Boolean, default: true },
  isBorrowed: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Linking to the User model
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Linking to the User model
});




module.exports = mongoose.model('Book', bookSchema);