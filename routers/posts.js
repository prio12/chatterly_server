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
const verifyJwtToken = require('../middlewares/verifyJwtToken');

const router = express.Router();

//create A new Post
router.post('/', verifyJwtToken, createAPost);

//get all posts
router.get('/', verifyJwtToken, getAllPosts);

//get a specific post
router.get('/:id', verifyJwtToken, getSpecificPostDetails);

//update a post
router.patch('/:id', verifyJwtToken, updateAPost);

//delete a post
router.delete('/:id', verifyJwtToken, deleteAPost);

//update like of a specific post
router.patch('/likes/:id', verifyJwtToken, handleLikeAndNotify);

//add comments to a specific user
router.patch('/comments/:id', verifyJwtToken, addCommentToAPost);

//update a user's comment to a specific post
router.patch('/comments/update/:postId', verifyJwtToken, editComment);

//delete a comment of a specific user to a specific post
router.patch(
  '/comments/delete/:postId/:commentId',
  verifyJwtToken,
  deleteAComment
);
module.exports = router;
