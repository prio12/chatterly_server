//external imports
const express = require('express');
const {
  getUserSpecificNotifications,
  handleMarkAsSeen,
  deleteANotification,
} = require('../controllers/notificationsController');

//creating notification route
const router = express.Router();

router.get('/:id', getUserSpecificNotifications);

router.patch('/:id', handleMarkAsSeen);

router.delete('/:id', deleteANotification);

module.exports = router;
