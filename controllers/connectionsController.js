const Connection = require('../models/connectionsModel');
const User = require('../models/usersModel');
const {
  handleConnectionRequestNotification,
  handleConnectionRequestAcceptNotification,
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
    const response = await Connection.find({ recipient: id, status: 'pending' })
      .populate('requester')
      .sort({ createdAt: -1 });
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
    const filteredUsers = allUsers.filter(
      (user) => !connectedUsersIds.includes(user._id.toString())
    );

    //removing the currentlyLoggedInUser from filteredUsers (not to render thyself in connectionSuggestions)

    const suggestedConnections = filteredUsers.filter(
      (user) => user?._id.toString() !== id
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

//accept connection request (updating the status to accepted)
async function acceptConnectionRequest(req, res) {
  const id = req.params.id;
  const { notificationSender, notificationRecipient } = req.body;

  try {
    const connectionData = await Connection.findById(id);
    if (!connectionData) {
      return res.status(400).json({
        success: false,
        error: 'Something went wrong!',
      });
    }

    //updating pending to accepted
    const response = await Connection.findByIdAndUpdate(id, {
      status: 'accepted',
    });

    await handleConnectionRequestAcceptNotification({
      notificationSender,
      notificationRecipient,
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

//ignore a connection request or decline/delete a connection request
async function ignoreAConnectionRequest(req, res) {
  const id = req.params.id;
  try {
    const response = await Connection.findByIdAndDelete(id);
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

//get all connections (friends) of a specific user
async function getMyConnections(req, res) {
  const id = req.params.id;
  try {
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ requester: id }, { recipient: id }],
    })
      .populate('requester')
      .populate('recipient')
      .sort({ createdAt: -1 });

    //here just sending the friends/connections profile rather sending both requester and recipient(cause no point to send the currentlyLogged in user in response)
    const myConnections = connections.map((connection) => {
      //getting the requester _id
      const requesterId = connection.requester._id.toString();
      const myConnection =
        requesterId === id ? connection.recipient : connection.requester;
      return {
        connectionId: connection._id,
        myConnection,
      };
    });

    res.status(200).json({
      success: true,
      myConnections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

//get all sent connections requests of a individual user
async function getAllSentRequests(req, res) {
  const id = req.params.id;
  try {
    const response = await Connection.find({ requester: id }).populate(
      'recipient'
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

//check connection status between two users eg:(accepted, pending)
async function checkConnectionStatus(req, res) {
  const currentlyLoggedInUserId = req.params.userId;
  const targetedUserId = req.params.targetId;

  try {
    const connection = await Connection.findOne({
      $or: [
        { requester: currentlyLoggedInUserId, recipient: targetedUserId },
        { requester: targetedUserId, recipient: currentlyLoggedInUserId },
      ],
    });

    if (!connection) {
      return res.status(200).json({
        connection: false,
        status: 'none',
      });
    }

    const isRequester =
      currentlyLoggedInUserId === connection.requester.toString();

    //defining the default action (if the status is accepted)
    let action = 'disconnect';

    //checking if the connection status is pending
    if (connection.status === 'pending') {
      action = isRequester ? 'cancel' : 'accept';
    }

    res.status(200).json({
      connection: true,
      connectionId: connection._id,
      status: connection.status,
      action,
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
  getConnectionSuggestions,
  acceptConnectionRequest,
  ignoreAConnectionRequest,
  getMyConnections,
  getAllSentRequests,
  checkConnectionStatus,
};
