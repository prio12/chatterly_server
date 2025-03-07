//external imports

const mongoose = require('mongoose');
const User = require('./usersModel');

const { Schema } = mongoose;

const postsSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    img: {
      type: String,
      default: '',
    },
    video: {
      type: String,
      default: '',
    },
    likes: [
      {
        type: Schema.Types.ObjectId, // Store UID of users who liked the post
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postsSchema);
module.exports = Post;
