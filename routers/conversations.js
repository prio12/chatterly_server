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
} = require('../controllers/conversationController');

//creating conversation route
const router = express.Router();

//init a conversation
router.post('/', createConversation);

//get all conversations of a specific user
router.get('/:id', getUserConversations);

//get all messages of a specific conversation
router.get('/messages/between', getMessages);

//mark a conversation as read
router.patch('/:id/read', markConversationAsRead);

//edit a message
router.patch('/message/edit', editMessage);

//delete single message
router.patch('/message/delete/:id', deleteSingleMessage);

//delete all messages
// router.delete('/messages/delete', async (req, res) => {
//   await Message.deleteMany({});
// });

module.exports = router;
