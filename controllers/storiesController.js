const Connection = require('../models/connectionsModel');
const Story = require('../models/storiesModel');

//create a new story of a specific user
async function addANewStory(req, res) {
  //creating new story using Story Model
  const newStory = new Story(req.body);

  // saving in db
  try {
    const response = await newStory.save();
    res.status(200).json({
      success: true,
      response,
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
    const stories = await Story.find({ author: storiesAuthor }).populate(
      'author'
    );

    const activeStories = stories.filter((story) => {
      const createdAt = story.createdAt;
      const now = new Date();
      const timeDifferences = now - createdAt;

      return timeDifferences <= 24 * 60 * 60 * 1000;
    });

    //send response
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
