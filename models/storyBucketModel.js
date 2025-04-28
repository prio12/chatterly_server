const mongoose = require('mongoose');
const { Schema } = mongoose;

const storyBucketSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the 'User' collection (who the bucket belongs to)
    },
    stories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Story', // References to stories in the Story collection
      },
    ],
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
  }
);

const StoryBucket = mongoose.model('StoryBucket', storyBucketSchema);
module.exports = StoryBucket;
