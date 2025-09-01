const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },

  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
