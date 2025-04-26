//external imports
const express = require('express');
//internal imports
const verifyJwtToken = require('../middlewares/verifyJwtToken');
const { addANewStory } = require('../controllers/storiesController');

const router = express.Router();

//add a new story of  a specific user
router.post('/', addANewStory);

module.exports = router;
