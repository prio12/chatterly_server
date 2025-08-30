//external imports
const express = require('express');

const verifyJwtToken = require('../middlewares/verifyJwtToken');
const { createConversation } = require('../controllers/conversationController');

//creating conversation route
const router = express.Router();

//init a conversation
router.post('/', createConversation);

module.exports = router;
