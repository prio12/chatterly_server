const mongoose = require('mongoose');
const { Schema } = mongoose;

const storySchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model('Story', storySchema);
module.exports = Story;
