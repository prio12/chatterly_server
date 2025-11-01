const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // text: String,
    text: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['sent', 'delivered'],
      default: 'sent',
    },
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeletedForEveryone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
