//external imports
const express = require('express');

const verifyJwtToken = require('../middlewares/verifyJwtToken');
const {
  createConversation,
  getUserConversations,
  markConversationAsRead,
  getMessages,
  initiateEmptyConversation,
  deleteMessages,
} = require('../controllers/conversationController');

//creating conversation route
const router = express.Router();

//init a conversation
router.post('/', createConversation);

//get all conversations of a specific user
router.get('/:id', getUserConversations);

//get all messages of a specific conversation
router.get('/messages/between', getMessages);

//initiate an empty conversation
router.post('/initiate/conversation', initiateEmptyConversation);

//mark a conversation as read
router.patch('/:id/read', markConversationAsRead);

module.exports = router;
