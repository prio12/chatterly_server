const Post = require('../models/postModel');
const User = require('../models/usersModel');

//creating a new post and saving in db
async function createAPost(req, res) {
  //destructuring from req.body
  const { author, content, img } = req.body;

  if (!author) {
    return res.status(400).json({
      error: 'Author ID is required',
    });
  }

  if (!content && !img) {
    return res.status(400).json({
      error: 'Either content or an image is required',
    });
  }

  //checking if the requested user exists in db
  const userExists = await User.findById(author);
  if (!userExists) {
    return res.status(404).json({
      error: 'User Not Found!',
    });
  }

  //storing post data in db
  try {
    const newPost = new Post(req.body);
    const result = await newPost.save();

    await User.findByIdAndUpdate(author, {
      $push: { posts: result._id },
    });

    if (result) {
      res.status(200).json({
        result,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

//get all posts
async function getAllPosts(req, res) {
  try {
    const result = await Post.find({})
      .populate('author')
      .sort({ createdAt: -1 });
    res.status(200).json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error. Please try again later.',
    });
  }
}

//update a specific post
async function updateAPost(req, res) {
  const _id = req.params.id;
  const updatedDoc = {
    $set: {
      content: req.body.content,
    },
  };

  try {
    const postExists = await Post.findById(_id);

    if (!postExists) {
      return res.status(400).json({
        success: false,
        error: 'Post Not Found!!',
      });
    }

    const response = await Post.findByIdAndUpdate(_id, updatedDoc, {
      new: true,
    });
    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
}

//delete a specific post
async function deleteAPost(req, res) {
  const postId = req.params.id;

  try {
    //find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found!',
      });
    }
    const authorId = post.author;

    //deleting the post from postCollection
    await Post.findByIdAndDelete(postId);

    //Remove the post reference from the correct user's (author's) posts array
    await User.findByIdAndUpdate(authorId, {
      $pull: { posts: postId },
    });

    //sending response
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error!',
    });
  }
}

module.exports = {
  createAPost,
  getAllPosts,
  updateAPost,
  deleteAPost,
};
