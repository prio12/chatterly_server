const Conversation = require('../models/ConversationModel');
const Message = require('../models/messageModel');
const User = require('../models/usersModel');
const { getUsers, getIo } = require('../socketServer');

//create a new conversation
async function createConversation(req, res) {
  //getting stored users from users map
  const users = getUsers();
  //getting io to emit and event
  const io = getIo();

  const { participants, sender, text, senderUid, receiverUid } = req.body;

  const senderSocketId = users.get(senderUid);
  const receiverSocketId = users.get(receiverUid);

  const receiverId = participants.find((_id) => _id !== sender);

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

    let messageStatus = receiverSocketId ? 'delivered' : 'sent';
    //making new message
    const newMessage = new Message({
      conversation: conversation?._id,
      sender,
      text,
      status: messageStatus,
    });
    await newMessage.save();

    let populatedMessage = await Message.findById(newMessage._id)
      .populate({ path: 'sender', select: '_id uid profilePicture name' })
      .populate({ path: 'seenBy', select: '_id' });

    //emitting the socket event
    if (populatedMessage && io && receiverId) {
      const conversationId = conversation._id.toString();
      const clientsInRoom = io.sockets.adapter.rooms.get(conversationId); //here get the socketId of the users who are in this room
      const receiverIsInRoom =
        clientsInRoom &&
        receiverSocketId &&
        clientsInRoom.has(receiverSocketId);
      if (receiverIsInRoom) {
        const receiver = await User.findById(receiverId);
        if (receiver) {
          populatedMessage.seenBy.push(receiver);
          //update the message seen status in db
          await Message.findByIdAndUpdate(populatedMessage._id, {
            $addToSet: { seenBy: receiver._id },
          });
        }
      }
      io.to(conversationId).emit('newMessage', populatedMessage);
    }

    conversation.lastMessage = populatedMessage._id;

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

    const filteredConversations = conversations.filter(
      (conversation) => conversation.lastMessage !== null
    );

    res.status(200).json({
      success: true,
      conversations: filteredConversations,
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
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({
      success: false,
      error: 'Both user IDs are required',
    });
  }

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });

    if (!conversation) {
      const participants = [user1, user2];
      const unreadCounts = new Map();
      participants.forEach((_id) => unreadCounts.set(_id, 0));

      conversation = new Conversation({
        participants,
        unreadCounts,
      });
      await conversation.save();

      return res.status(200).json({
        success: true,
        messages: [],
        conversationId: conversation._id,
      });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate({ path: 'sender', select: '_id uid profilePicture name' })
      .populate({ path: 'seenBy', select: '_id uid profilePicture' });

    res.status(200).json({
      success: true,
      messages,
      conversationId: conversation._id,
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
      return res.status(400).json({
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

//edit a message
async function editMessage(req, res) {
  const { message, editedMessage } = req.body;
  const _id = message?._id;

  const io = getIo();
  try {
    const storedMessage = await Message.findById(_id);
    if (!storedMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found.',
      });
    }

    const response = await Message.findByIdAndUpdate(
      _id,
      {
        text: editedMessage,
      },
      { new: true }
    );

    const populatedMessage = await Message.findById(response._id)
      .populate({ path: 'sender', select: '_id uid profilePicture name' })
      .populate({ path: 'seenBy', select: '_id' });

    io.to(populatedMessage.conversation.toString()).emit('messageEdited', {
      updatedMessage: populatedMessage,
    });

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!' || error.message,
    });
  }
}

//delete Single message
async function deleteSingleMessage(req, res) {
  console.log(req.params.id);
}

module.exports = {
  createConversation,
  getUserConversations,
  markConversationAsRead,
  getMessages,
  editMessage,
  deleteSingleMessage,
};
