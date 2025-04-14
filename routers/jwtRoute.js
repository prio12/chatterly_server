//external imports
const express = require('express');
const { issueJwtToken } = require('../controllers/jwtController');

//creating jwt route
const router = express.Router();

router.post('/', issueJwtToken);

module.exports = router;
