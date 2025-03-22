//external imports

const mongoose = require('mongoose');

const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;
