const Conversation = require('../models/ConversationModel');
const Message = require('../models/messageModel');
const User = require('../models/usersModel');

//emit an event when a specific user is online to change message status sent to delivered
async function handleUserOnline(uid, io) {
  const user = await User.findOne({ uid });

  if (!user) return;

  const conversations = await Conversation.find({
    participants: user._id,
  }).select('_id');

  const conversationIds = conversations.map((c) => c._id);

  await Message.updateMany(
    {
      conversation: { $in: conversationIds },
      sender: { $ne: user._id },
      status: 'sent',
    },
    { status: 'delivered' }
  );

  io.emit('messagesDeliveredUpdate', { userId: user._id, conversationIds });
}

module.exports = {
  handleUserOnline,
};
