//external imports
const express = require('express');
const { addNewUser, getAllUsers } = require('../controllers/usersController');

//internal imports

const router = express.Router();

router.post('/users', addNewUser);

module.exports = router;
