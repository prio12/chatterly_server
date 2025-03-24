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
    console.log(response);

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

module.exports = {
  createConnectionRequest,
};
