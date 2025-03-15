//external imports
const express = require('express');
const {
  getUserSpecificNotifications,
  handleMarkAsSeen,
  deleteANotification,
  handleMarkAsRead,
} = require('../controllers/notificationsController');

//creating notification route
const router = express.Router();

router.get('/:id', getUserSpecificNotifications);

router.patch('/:id', handleMarkAsSeen);

router.patch('/:id/mark-as-read', handleMarkAsRead);

router.delete('/:id', deleteANotification);

module.exports = router;
