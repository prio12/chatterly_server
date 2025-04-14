//external imports
const express = require('express');
const {
  getUserSpecificNotifications,
  handleMarkAsSeen,
  deleteANotification,
  handleMarkAsRead,
} = require('../controllers/notificationsController');
const verifyJwtToken = require('../middlewares/verifyJwtToken');

//creating notification route
const router = express.Router();

router.get('/:id', verifyJwtToken, getUserSpecificNotifications);

router.patch('/:id', verifyJwtToken, handleMarkAsSeen);

router.patch('/:id/mark-as-read', verifyJwtToken, handleMarkAsRead);

router.delete('/:id', verifyJwtToken, deleteANotification);

module.exports = router;
