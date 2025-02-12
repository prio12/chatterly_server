//external imports
const express = require('express');
const { createAPost } = require('../controllers/postsController');

const router = express.Router();

//create A new Post
router.post('/', createAPost);

module.exports = router;
