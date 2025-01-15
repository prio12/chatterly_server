//external imports
const express = require('express');
const { postAllUsers, getAllUsers } = require('../controllers/usersController');

//internal imports

const router = express.Router();

router.post('/users', postAllUsers);
router.get('/users', getAllUsers);

module.exports = router;
