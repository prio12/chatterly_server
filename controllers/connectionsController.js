const Connection = require('../models/connectionsModel');
const User = require('../models/usersModel');
const {
  handleConnectionRequestNotification,
} = require('./notificationsController');

//add all connection request in db
async function createConnectionRequest(req, res) {
  const { requester, recipient, requesterUid, recipientUid } = req.body;

  try {
    //checking if the request already exist
    const existingRequest = await Connection.findOne({ requester, recipient });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'Connection request already sent.',
      });
    }

    //creating new request
    const newRequest = new Connection({
      requester,
      recipient,
    });

    //saving new connection request in db
    const response = await newRequest.save();

    await handleConnectionRequestNotification({
      recipientUid,
      requester,
      recipient,
    });

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

//get connection request of a specific user
async function getConnectionRequests(req, res) {
  const id = req.params.id;

  try {
    const response = await Connection.find({ recipient: id }).populate(
      'requester'
    );
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

//get connections suggestion of a specific user
async function getConnectionSuggestions(req, res) {
  const id = req.params.id; //mongodb _id

  try {
    //getting all users
    const allUsers = await User.find({});

    //getting all specific user's connection
    const userConnections = await Connection.find({
      $or: [{ requester: id }, { recipient: id }],
    });

    //making an flat array of requester and recipient mongoDb id's
    const connectedUsersIds = userConnections.flatMap((user) => [
      user.recipient.toString(),
      user.requester.toString(),
    ]);

    //filtering suggestedConnections
    const suggestedConnections = allUsers.filter(
      (user) => !connectedUsersIds.includes(user._id.toString())
    );

    res.status(200).json({
      success: true,
      suggestedConnections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
}

module.exports = {
  createConnectionRequest,
  getConnectionRequests,
  getConnectionSuggestions,
};
