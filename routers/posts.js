//external imports
const express = require('express');
const {
  createAPost,
  getAllPosts,
  updateAPost,
  deleteAPost,
  getSpecificPostDetails,
  handleLikeAndNotify,
  addCommentToAPost,
  editComment,
  deleteAComment,
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

//update like of a specific post
router.patch('/likes/:id', handleLikeAndNotify);

//add comments to a specific user
router.patch('/comments/:id', addCommentToAPost);

//update a user's comment to a specific post
router.patch('/comments/update/:postId', editComment);

//delete a comment of a specific user to a specific post
router.patch('/comments/delete/:postId/:commentId', deleteAComment);
module.exports = router;
