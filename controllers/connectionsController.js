const Connection = require('../models/connectionsModel');

//add all connection request in db
async function createConnectionRequest(req, res) {
  const { requester, recipient } = req.body;

  //creating new request
  const newRequest = new Connection({
    requester,
    recipient,
  });

  try {
    //saving new connection request in db
    const response = await newRequest.save();

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
