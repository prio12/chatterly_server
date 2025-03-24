//external imports
const express = require('express');
const {
  createConnectionRequest,
  getConnectionRequests,
  getConnectionSuggestions,
} = require('../controllers/connectionsController');

//creating connections route
const router = express.Router();

//add connections request in db
router.post('/', createConnectionRequest);

//get connection request of a specific user
router.get('/:id', getConnectionRequests);

//get connection suggestions of a specific user
router.get('/suggestions/:id', getConnectionSuggestions);

module.exports = router;
