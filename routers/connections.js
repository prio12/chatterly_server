//external imports
const express = require('express');
const {
  createConnectionRequest,
  getConnectionRequests,
  getConnectionSuggestions,
  acceptConnectionRequest,
  ignoreAConnectionRequest,
  getMyConnections,
} = require('../controllers/connectionsController');

//creating connections route
const router = express.Router();

//add connections request in db
router.post('/', createConnectionRequest);

//get connection request of a specific user
router.get('/:id', getConnectionRequests);

//accept connection request (updating the status to accepted)
router.patch('/:id', acceptConnectionRequest);

//get connection suggestions of a specific user
router.get('/suggestions/:id', getConnectionSuggestions);

//ignore a connection request/remove a connection request
router.delete('/:id', ignoreAConnectionRequest);

//fetch all connections (friends) of a specific user
router.get('/myConnections/:id', getMyConnections);

module.exports = router;
