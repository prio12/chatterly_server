//external imports
const express = require('express');
const {
  createConnectionRequest,
  getConnectionRequests,
  getConnectionSuggestions,
  acceptConnectionRequest,
  ignoreAConnectionRequest,
  getMyConnections,
  getAllSentRequests,
  checkConnectionStatus,
} = require('../controllers/connectionsController');
const verifyJwtToken = require('../middlewares/verifyJwtToken');

//creating connections route
const router = express.Router();

//add connections request in db
router.post('/', verifyJwtToken, createConnectionRequest);

//get connection request of a specific user
router.get('/:id', verifyJwtToken, getConnectionRequests);

//accept connection request (updating the status to accepted)
router.patch('/:id', verifyJwtToken, acceptConnectionRequest);

//get connection suggestions of a specific user
router.get('/suggestions/:id', verifyJwtToken, getConnectionSuggestions);

//ignore a connection request/remove a connection request
router.delete('/:id', verifyJwtToken, ignoreAConnectionRequest);

//fetch all connections (friends) of a specific user
router.get('/myConnections/:id', verifyJwtToken, getMyConnections);

//fetch all sent connectionsRequest of a individual user
router.get('/sentRequests/:id', verifyJwtToken, getAllSentRequests);

//check connection status (accepted,pending) between two users
router.get('/status/:userId/:targetId', verifyJwtToken, checkConnectionStatus);

module.exports = router;
