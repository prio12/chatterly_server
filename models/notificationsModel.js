const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationsSchema = new Schema({
  type: {
    type: String,
    enum: [
      'like',
      'comment',
      'connection_request',
      'connection_accept',
      'message',
    ],
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  //   message: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Message'
  //   },
  read: {
    type: Boolean,
    default: false,
  },
  seen: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', notificationsSchema);
module.exports = Notification;
