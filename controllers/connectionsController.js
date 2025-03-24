const Connection = require('../models/connectionsModel');
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

module.exports = {
  createConnectionRequest,
  getConnectionRequests,
};
