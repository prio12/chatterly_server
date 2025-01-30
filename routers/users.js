//external imports
const express = require('express');
const {
  addNewUser,
  updateUserInfo,
  getUserByUid,
} = require('../controllers/usersController');

//internal imports

const router = express.Router();

//add a new user to db after signing up for the first time
router.post('/users', addNewUser);

//get method to get a userSpecific info by uid
router.get('/users/:uid', getUserByUid);

//update any field of a specific user eg:(profile pic, cover photo, bio)
router.patch('/users/:uid', updateUserInfo);

module.exports = router;
