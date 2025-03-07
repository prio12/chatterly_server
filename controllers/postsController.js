const Post = require('../models/postModel');
const User = require('../models/usersModel');

//creating a new post and saving in db
async function createAPost(req, res) {
  //destructuring from req.body
  const { author, content, img, video } = req.body;

  if (!author) {
    return res.status(400).json({
      error: 'Author ID is required',
    });
  }

  if (!content && !img && !video) {
    return res.status(400).json({
      error: 'Either content or an image or a video  is required',
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

//updating likeCount of a post and also notification using socket.io in realtime
async function handleLikeAndNotify({ userId, postId, callback }) {
  try {
    const post = await Post.findById(postId);
    //checking if the post exists!
    if (!post) {
      return callback({
        success: false,
        error: 'Post not found!',
      });
    }

    //checking if the user has already liked the post
    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
      return callback({
        success: false,
        error: 'User has liked the post already!',
      });
    }

    //add likes
    post.likes.push(userId);
    await post.save();

    //finding user to update his likedPosts
    const user = await User.findById(userId);

    if (!user)
      return callback({
        success: false,
        error: 'User not Found!',
      });

    user.likedPosts.push(postId);
    await user.save();
  } catch (error) {}
}
module.exports = {
  createAPost,
  getAllPosts,
  updateAPost,
  deleteAPost,
  handleLikeAndNotify,
};
