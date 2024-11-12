
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, required: true,default:false },  // Add password field  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Linking to the User model
});




module.exports = mongoose.model('Notification', notificationSchema);