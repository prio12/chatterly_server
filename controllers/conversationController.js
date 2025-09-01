const Conversation = require('../models/ConversationModel');
const Message = require('../models/messageModel');

//create a new conversation
async function createConversation(req, res) {
  const { participants, sender, text } = req.body;
  if (!(participants && participants.length > 1) || !sender || !text) {
    return res.status(400).json({
      error: 'Minimum two participants, sender and text required',
    });
  }
  try {
    //looking for the conversation id of two certain participants
    let conversation = await Conversation.findOne({
      participants: { $all: participants },
    });
    if (!conversation) {
      conversation = new Conversation({ participants });
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
    await conversation.save();
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
module.exports = { createConversation };
