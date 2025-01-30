//external imports
const express = require('express');
const {
  addNewUser,
  updateUserInfo,
} = require('../controllers/usersController');

//internal imports

const router = express.Router();

//add a new user to db after signing up for the first time
router.post('/users', addNewUser);

//update any field of a specific user eg:(profile pic, cover photo, bio)
router.patch('/users/:id', updateUserInfo);

module.exports = router;
