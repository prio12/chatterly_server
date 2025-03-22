//external imports
const express = require('express');
const {
  createConnectionRequest,
} = require('../controllers/connectionsController');

//creating connections route
const router = express.Router();

//add connections request in db
router.post('/', createConnectionRequest);

module.exports = router;
