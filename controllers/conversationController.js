const Conversation = require('../models/ConversationModel');
const Message = require('../models/messageModel');
const { getUsers, getIo } = require('../socketServer');

//create a new conversation
async function createConversation(req, res) {
  //getting stored users from users map
  const users = getUsers();
  //getting io to emit and event
  const io = getIo();

  const { participants, sender, text, senderUid, receiverUid } = req.body;
  if (!(participants && participants.length > 1) || !sender || !text) {
    return res.status(400).json({
      error: 'Minimum two participants, sender and text required',
    });
  }
  try {
    //looking for the conversation id of two certain participants
    let conversation = await Conversation.findOne({
      participants: { $all: participants },
    }).populate('lastMessage');

    //if the conversation doesn't exit from earlier
    //create a new conversation with participants and last message with default value
    //set initial unreadCounts for both participants

    if (!conversation) {
      const unreadCounts = new Map();
      participants.forEach((_id) => unreadCounts.set(_id, 0));

      conversation = new Conversation({
        participants,
        unreadCounts,
      });
      await conversation.save();
    }
    //making new message
    const newMessage = new Message({
      conversation: conversation?._id,
      sender: '680fc98389d43fd618647bc6',
      text,
    });
    await newMessage.save();
    conversation.lastMessage = newMessage._id;

    //update unreadCounts for this message
    participants.forEach((_id) => {
      if (sender === _id) {
        conversation.unreadCounts.set(_id, 0);
      } else {
        const prev = conversation.unreadCounts.get(_id) || 0;
        conversation.unreadCounts.set(_id, prev + 1);
      }
    });

    await conversation.save();

    // re-fetch with populated lastMessage
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('lastMessage')
      .populate('participants');

    //sending socket event to update chatList
    const senderSocketId = users.get(senderUid);
    const receiverSocketId = users.get(receiverUid);

    //sending event to the text sender to update the chatList
    if (senderSocketId) {
      io.to(senderSocketId).emit('conversationUpdated', populatedConversation);
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        'conversationUpdated',
        populatedConversation
      );
    }

    res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server side error!',
    });
  }
}

//get user Conversations
async function getUserConversations(req, res) {
  const _id = req.params.id;
  try {
    const conversations = await Conversation.find({ participants: _id })
      .sort({
        updatedAt: -1,
      })
      .populate('lastMessage')
      .populate('participants');

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

//mark a conversation as read
async function markConversationAsRead(req, res) {
  try {
    let conversationExist = await Conversation.findById(req.params.id);

    if (!conversationExist) {
      res.status(400).json({
        success: false,
        error: 'Conversation not found!',
      });
    }

    //change the unread counts of the user
    conversationExist.unreadCounts.set(req.body.userId, 0);
    await conversationExist.save();

    console.log(conversationExist, 'after reset');
  } catch (error) {}
  res.status(200).json({
    success: true,
  });
}
module.exports = {
  createConversation,
  getUserConversations,
  markConversationAsRead,
};
