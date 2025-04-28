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
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model('Story', storiesSchema);
module.exports = Story;
