//external imports
const express = require('express');

const verifyJwtToken = require('../middlewares/verifyJwtToken');
const {
  createConversation,
  getUserConversations,
} = require('../controllers/conversationController');

//creating conversation route
const router = express.Router();

//init a conversation
router.post('/', createConversation);

//get all conversations of a specific user
router.get('/:id', getUserConversations);

module.exports = router;
