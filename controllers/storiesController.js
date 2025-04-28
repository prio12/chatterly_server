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

//get all stories of a user and user specific connections
async function getStories(req, res) {
  const id = req.params.id;

  try {
    //find loggedInUser's connections first
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ requester: id }, { recipient: id }],
    });

    //excluding loggedInUser
    const myConnections = connections.map((connection) => {
      const requesterId = connection?.requester?._id.toString();
      const myConnectionsId =
        requesterId === id ? connection?.recipient?._id : requesterId;

      return myConnectionsId;
    });

    //id's to fetch stories  , now include loggedInUserid to the myConnectionsId
    const storiesAuthor = [...myConnections, id];

    //find stories
    const storyBuckets = await StoryBucket.find({
      author: { $in: storiesAuthor },
    }).populate('author');

    const activeStories = storyBuckets.filter((story) => {
      const createdAt = story.createdAt;
      const now = new Date();
      const timeDifferences = now - createdAt;

      return timeDifferences <= 24 * 60 * 60 * 1000;
    });

    // send response
    res.status(200).json({
      success: true,
      activeStories,
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
};
