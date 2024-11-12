// app.js
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const bookRoutes = require('./routes/bookRoutes'); // Import user routes
const loginRoutes = require('./routes/loginRoutes'); // Import user routes
const notificationRoutes = require('./routes/notificationRoutes'); // Import user routes
const cors = require('cors');
const app = express();
const PORT = 5000;
require('dotenv').config();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

//const User = require('../models/User');
app.use(cors());
// Use the user routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/notification', notificationRoutes);


// Sample route
app.get('/Test', (req, res) => {
  res.send('Hello, MongoDB with Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
