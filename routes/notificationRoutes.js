const express = require('express');
const Notification = require('../models/Notification'); // Adjust path based on your directory structure

const router = express.Router();

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { UserID, Message, Type } = req.body;

    const newNotification = new Notification({
      UserID,
      Message,
      Type,
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all notifications for a user
router.get('/', async (req, res) => {
  try {
    
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ UserID: userId });
    const unreadCount = notifications.filter(notification => !notification.IsRead).length;
    res.status(200).json({notifications,unreadCount});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { IsRead: true },
      { new: true } // Return the updated document
    );

    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const notificationId = req.params.id;
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a notification as read
router.patch('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { IsRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
