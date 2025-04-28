//external imports
const express = require('express');
//internal imports
const verifyJwtToken = require('../middlewares/verifyJwtToken');
const {
  addANewStory,
  getStories,
} = require('../controllers/storiesController');

const router = express.Router();

//add a new story of  a specific user
router.post('/', verifyJwtToken, addANewStory);

//get all stories of a user and user specific connections
router.get('/:id', getStories);

module.exports = router;
