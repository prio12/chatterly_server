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
async function handleLikeAndNotify({ userId, postId, action, callback }) {
  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post) {
      return callback({
        success: false,
        error: 'Post not found!',
      });
    }

    if (!user) {
      return callback({
        success: false,
        error: 'User not found!',
      });
    }

    const hasLiked = post.likes.includes(userId);

    // Handle dislike (unlike) action
    if (action === 'dislike' && hasLiked) {
      // Convert to string to ensure proper comparison/removal
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      user.likedPosts = user.likedPosts.filter(
        (id) => id.toString() !== postId.toString()
      );

      await post.save();
      await user.save();

      return callback({
        success: true,
        liked: false,
        likes: post.likes,
      });
    }

    // Handle like action
    if (action === 'like' && !hasLiked) {
      post.likes.push(userId);
      user.likedPosts.push(postId);

      await post.save();
      await user.save();

      //  Lazy import here to break the circular dependency
      const { handleLikedNotification } = require('./notificationsController');
      handleLikedNotification({ post, userId });

      return callback({
        success: true,
        liked: true,
        likes: post.likes,
      });
    }

    // If no action was taken (already liked/unliked)
    return callback({
      success: false,
      error: action === 'like' ? 'Already liked' : 'Not liked yet',
      likes: post.likes,
    });
  } catch (error) {
    console.error('Error in handleLikeAndNotify:', error);
    return callback({ success: false, error: 'Something went wrong!' });
  }
}

module.exports = {
  createAPost,
  getAllPosts,
  updateAPost,
  deleteAPost,
  handleLikeAndNotify,
};
