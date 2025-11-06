//external imports
const express = require('express');

const verifyJwtToken = require('../middlewares/verifyJwtToken');
const {
  createConversation,
  getUserConversations,
  markConversationAsRead,
  getMessages,
  editMessage,
  deleteSingleMessage,
  deleteAllMessages,
} = require('../controllers/conversationController');
const User = require('../models/usersModel');

//creating conversation route
const router = express.Router();

//init a conversation
router.post('/', verifyJwtToken, createConversation);

//get all conversations of a specific user
router.get('/:id', verifyJwtToken, getUserConversations);

//get all messages of a specific conversation
router.get('/messages/between', verifyJwtToken, getMessages);

//mark a conversation as read
router.patch('/:id/read', verifyJwtToken, markConversationAsRead);

//edit a message
router.patch('/message/edit', verifyJwtToken, editMessage);

//delete single message
router.patch('/message/delete/:id', verifyJwtToken, deleteSingleMessage);

//delete all messages
router.patch('/message/deleteAll/:id', verifyJwtToken, deleteAllMessages);

module.exports = router;
