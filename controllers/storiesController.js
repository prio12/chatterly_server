const Connection = require('../models/connectionsModel');
const Story = require('../models/storiesModel');
const StoryBucket = require('../models/storyBucketModel');

//create a new story of a specific user
async function addANewStory(req, res) {
  const { author, mediaUrl } = req.body;

  try {
    const newStory = new Story({ author, mediaUrl });

    //save the story
    const savedStory = await newStory.save();

    // find the storyBucket of a specific User
    let userStoryBucket = await StoryBucket.findOne({ author: author });

    if (!userStoryBucket) {
      userStoryBucket = new StoryBucket({
        author: author,
        stories: [savedStory._id],
      });
    } else {
      userStoryBucket.stories.push(savedStory._id);
    }

    //save the usersStoryBucket after updating/creating for the first time
    await userStoryBucket.save();

    //response
    res.status(200).json({
      success: true,
      story: savedStory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

// Get all stories of a user and user-specific connections
async function getStories(req, res) {
  const id = req.params.id;

  try {
    //  Find loggedInUser's accepted connections
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ requester: id }, { recipient: id }],
    });

    //  Extract the other user's ID from each connection
    const myConnections = connections.map((connection) => {
      const requesterId = connection?.requester?._id.toString();
      return requesterId === id
        ? connection?.recipient?._id.toString()
        : requesterId;
    });

    //  Create an array of userIds including the logged-in user
    const storiesAuthor = [...myConnections, id];

    //  Find story buckets belonging to those users
    const storyBuckets = await StoryBucket.find({
      author: { $in: storiesAuthor },
    })
      .populate('author')
      .populate('stories');

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Filter out old stories (older than 24 hours)
    const activeStories = storyBuckets
      .map((bucket) => {
        const validStories = bucket.stories.filter((story) => {
          return now - new Date(story.createdAt) <= oneDay;
        });

        return validStories.length > 0
          ? {
              ...bucket.toObject(), // convert Mongoose doc to plain object
              stories: validStories,
            }
          : null;
      })
      .filter(Boolean); // remove null entries

    // Step 6: Send response
    res.status(200).json({
      success: true,
      activeStories,
    });
  } catch (error) {
    console.error('Error getting stories:', error);
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

//delete a user specific story
async function deleteAStory(req, res) {
  const id = req.params.id;

  try {
    //find the story first to check if it really exists
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story is not found!',
      });
    }

    //deleting the story
    await Story.findByIdAndDelete(id);

    //send response
    res.status(200).json({
      success: true,
      message: 'Story Deleted Successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

module.exports = {
  addANewStory,
  getStories,
  deleteAStory,
};
