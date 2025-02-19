//external imports
const express = require('express');
const {
  createAPost,
  getAllPosts,
  updateAPost,
} = require('../controllers/postsController');

const router = express.Router();

//create A new Post
router.post('/', createAPost);

//get all posts
router.get('/', getAllPosts);

//update a post
router.patch('/:id', updateAPost);

module.exports = router;
