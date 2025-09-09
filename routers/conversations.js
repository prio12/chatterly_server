//external imports
const express = require('express');

const verifyJwtToken = require('../middlewares/verifyJwtToken');
const {
  createConversation,
  getUserConversations,
  markConversationAsRead,
} = require('../controllers/conversationController');

//creating conversation route
const router = express.Router();

//init a conversation
router.post('/', createConversation);

//get all conversations of a specific user
router.get('/:id', getUserConversations);

//mark a conversation as read
router.patch('/:id/read', markConversationAsRead);

module.exports = router;
