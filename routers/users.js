//external imports
const express = require('express');
const {
  addNewUser,
  updateUserInfo,
  getUserByUid,
  getAllUsers,
} = require('../controllers/usersController');
const verifyJwtToken = require('../middlewares/verifyJwtToken');

//internal imports

const router = express.Router();

// root route for server health check
router.get('/', (req, res) => {
  res.send('Chatterly Server is running!');
});

//add a new user to db after signing up for the first time
router.post('/users', verifyJwtToken, addNewUser);

//get all users
router.get('/users', verifyJwtToken, getAllUsers);

//get method to get a userSpecific info by uid
router.get('/users/:uid', verifyJwtToken, getUserByUid);

//update any field of a specific user eg:(profile pic, cover photo, bio)
router.patch('/users/:uid', verifyJwtToken, updateUserInfo);

module.exports = router;
