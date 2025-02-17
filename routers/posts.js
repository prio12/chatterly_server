//external imports
const express = require('express');
const { createAPost, getAllPosts } = require('../controllers/postsController');

const router = express.Router();

//create A new Post
router.post('/', createAPost);

//get all posts
router.get('/', getAllPosts);

module.exports = router;
