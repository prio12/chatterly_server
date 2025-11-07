const Conversation = require('../models/conversationModel');
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

//emit an event to message sender in realtime when a user sees a message
async function handleMessageSeenBy({ conversationId, userId, io }) {
  try {
    await Message.updateMany(
      {
        conversation: conversationId,
        seenBy: { $ne: userId },
      },
      { $addToSet: { seenBy: userId } }
    );

    let conversation = await Conversation.findById(conversationId);
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();

    // Notify all other users in that chat in real-time
    io.to(conversationId).emit('messagesReadUpdate', {
      conversationId,
      userId,
    });
  } catch (error) {
    console.log(error, 'getting this error!');
  }
}

module.exports = {
  handleUserOnline,
  handleMessageSeenBy,
};
