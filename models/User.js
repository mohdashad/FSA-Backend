// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true }
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); // Hash the password
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
