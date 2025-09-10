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
      sender,
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
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
        },
      })
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
      .populate('participants')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
        },
      });

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

//get all messages of a specific conversation
async function getMessages(req, res) {
  const conversationId = req.params.id;

  if (!conversationId) {
    return res.status(400).json({
      success: false,
      error: 'Conversation Id is missing!',
    });
  }
  try {
    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate({ path: 'sender', select: '_id' })
      .populate({ path: 'seenBy', select: '_id' });

    res.status(200).json({
      success: true,
      messages,
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
  const conversationId = req.params.id;
  const userId = req.body.userId;
  try {
    let conversationExist = await Conversation.findById(conversationId);

    if (!conversationExist) {
      res.status(400).json({
        success: false,
        error: 'Conversation not found!',
      });
    }

    //reset the unread counts of the user when he opens a conversation in the front end
    conversationExist.unreadCounts.set(userId, 0);
    await conversationExist.save();

    // mark all messages as seen for this user
    await Message.updateMany(
      {
        conversation: conversationId,
        seenBy: { $ne: userId },
      },
      { $addToSet: { seenBy: userId } }
    );

    //updated conversation
    const updatedConversation = await Conversation.findById(conversationId)
      .populate('lastMessage')
      .populate('participants')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
        },
      });

    res.status(200).json({
      success: true,
      updatedConversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}
module.exports = {
  createConversation,
  getUserConversations,
  markConversationAsRead,
  getMessages,
};
