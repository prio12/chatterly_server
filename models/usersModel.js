//external imports
const mongoose = require('mongoose');
const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    uid: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', usersSchema);

module.exports = User;
