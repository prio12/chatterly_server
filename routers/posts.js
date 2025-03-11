//external imports
const express = require('express');
const {
  createAPost,
  getAllPosts,
  updateAPost,
  deleteAPost,
  getSpecificPostDetails,
} = require('../controllers/postsController');

const router = express.Router();

//create A new Post
router.post('/', createAPost);

//get all posts
router.get('/', getAllPosts);

//get a specific post
router.get('/:id', getSpecificPostDetails);

//update a post
router.patch('/:id', updateAPost);

//delete a post
router.delete('/:id', deleteAPost);

module.exports = router;
