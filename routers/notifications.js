//external imports
const express = require('express');
const {
  getUserSpecificNotifications,
} = require('../controllers/notificationsController');

//creating notification route
const router = express.Router();

router.get('/:id', getUserSpecificNotifications);

module.exports = router;
