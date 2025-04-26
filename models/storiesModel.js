//external imports
const mongoose = require('mongoose');
const { Schema } = mongoose;

const storiesSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // TTL: 60 seconds (for testing)
    },
  },
  {
    timestamps: false,
  }
);

const Story = mongoose.model('Story', storiesSchema);
module.exports = Story;
