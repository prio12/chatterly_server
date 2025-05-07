//external imports
const express = require('express');
//internal imports
const verifyJwtToken = require('../middlewares/verifyJwtToken');
const {
  addANewStory,
  getStories,
  deleteAStory,
} = require('../controllers/storiesController');

const router = express.Router();

//add a new story of  a specific user
router.post('/', verifyJwtToken, addANewStory);

//get all stories of a user and user specific connections
router.get('/:id', verifyJwtToken, getStories);

//delete a specific user's story
router.delete('/:id', deleteAStory);

module.exports = router;
