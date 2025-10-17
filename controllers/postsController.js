const Post = require('../models/postModel');
const User = require('../models/usersModel');

let ioInstance; // File-level variable to store the io instance

//creating a new post and saving in db
async function createAPost(req, res) {
  if (!ioInstance) {
    const { getIo } = require('../socketServer'); // Lazy import
    ioInstance = getIo(); // Store the instance
  }
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
        success: true,
        result,
      });
    }

    //emit the event to broadcast the new post to all connected users
    await ioInstance.emit('newPost', { success: true });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

//get all posts
async function getAllPosts(req, res) {
  const { page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  try {
    let query = Post.find({})
      .populate('author')
      .populate('likes')
      .populate({
        path: 'comments.user',
      })
      .sort({ createdAt: -1 });

    if (Number(limit) > 0) {
      query = query.skip(skip).limit(Number(limit));
    }

    const result = await query;

    const total = await Post.countDocuments({});
    const hasMore = Number(limit) > 0 ? page * limit < total : false;

    res.status(200).json({
      result,
      hasMore,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error. Please try again later.',
    });
  }
}

//get a specific post
async function getSpecificPostDetails(req, res) {
  const postId = req.params.id;
  try {
    const response = await Post.findById(postId)
      .populate('author')
      .populate('likes')
      .populate({
        path: 'comments.user',
      });

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error!',
    });
  }
}

//update a specific post
async function updateAPost(req, res) {
  if (!ioInstance) {
    const { getIo } = require('../socketServer'); // Lazy import
    ioInstance = getIo(); // Reuse the stored instance
  }
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
    await response.populate([
      { path: 'author' },
      { path: 'likes' },
      { path: 'comments.user' },
    ]);

    if (response) {
      // Emit event
      ioInstance.emit('postInteraction', {
        success: true,
        updatedPost: response,
        isDeleted: false,
      });
    }

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
  if (!ioInstance) {
    const { getIo } = require('../socketServer'); // Lazy import
    ioInstance = getIo(); // Reuse the stored instance
  }
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
    const response = await Post.findByIdAndDelete(postId);
    await response.populate([
      { path: 'author' },
      { path: 'likes' },
      { path: 'comments.user' },
    ]);

    if (response) {
      // Emit event
      ioInstance.emit('postInteraction', {
        success: true,
        updatedPost: response,
        isDeleted: false,
      });
    }

    //Remove the post reference from the correct user's (author's) posts array
    await User.findByIdAndUpdate(authorId, {
      $pull: { posts: postId },
    });

    if (response) {
      // Emit event
      ioInstance.emit('postInteraction', {
        success: true,
        updatedPost: response,
        isDeleted: true,
      });
    }

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
async function handleLikeAndNotify(req, res) {
  if (!ioInstance) {
    const { getIo } = require('../socketServer'); // Lazy import
    ioInstance = getIo(); // Reuse the stored instance
  }
  const postId = req.params.id;
  const { userId, action, authorUid } = req.body;
  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    let updatedPost;

    if (!post) {
      return res.status(400).json({
        success: false,
        error: 'Post not found!',
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found!',
      });
    }

    const hasLiked = post.likes.includes(userId);

    // Handle dislike (unlike) action
    if (action === 'unLike' && hasLiked) {
      // Convert to string to ensure proper comparison/removal
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      user.likedPosts = user.likedPosts.filter(
        (id) => id.toString() !== postId.toString()
      );

      updatedPost = await post.save();
      await updatedPost.populate([
        { path: 'author' },
        { path: 'likes' },
        { path: 'comments.user' },
      ]);
      await user.save();

      res.status(200).json({
        success: true,
        liked: false,
        likes: post.likes,
        post: post,
      });
    }

    // Handle like action
    if (action === 'like' && !hasLiked) {
      post.likes.push(userId);
      user.likedPosts.push(postId);

      updatedPost = await post.save();
      await updatedPost.populate([
        { path: 'author' },
        { path: 'likes' },
        { path: 'comments.user' },
      ]);
      await user.save();

      //  Lazy import here to break the circular dependency
      const { handleLikedNotification } = require('./notificationsController');
      handleLikedNotification({ post, userId, authorUid, user });

      res.status(200).json({
        success: true,
        liked: true,
        likes: post.likes,
        post: post,
      });
    }
    //emitting an event via socket to get updated post to all connected users
    if (updatedPost) {
      // Emit event
      ioInstance.emit('postInteraction', {
        success: true,
        updatedPost: updatedPost,
        isDeleted: false,
      });
    }
  } catch (error) {
    res.status({ success: false, error: 'Something went wrong!' });
  }
}

//add a comment to the specific post
async function addCommentToAPost(req, res) {
  if (!ioInstance) {
    const { getIo } = require('../socketServer'); // Lazy import
    ioInstance = getIo(); // Reuse the stored instance
  }
  const id = req.params.id;
  const { user, authorId, text, authorUid } = req.body;

  const comment = { user, text };

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post Not Found!',
      });
    }

    post.comments.push(comment);
    const updatedPost = await post.save();
    await updatedPost.populate([
      { path: 'author' },
      { path: 'likes' },
      { path: 'comments.user' },
    ]);

    // Ensure handleCommentNotification completes before sending the response
    const { handleCommentNotification } = require('./notificationsController');
    await handleCommentNotification({
      authorId,
      post,
      userId: user,
      authorUid,
    });

    if (updatedPost) {
      // Emit event
      ioInstance.emit('postInteraction', {
        success: true,
        updatedPost,
        isDeleted: false,
      });
    }

    // Send response only after everything is done
    res.status(200).json({
      success: true,
      updatedPost,
    });
  } catch (error) {
    console.log(error, 'from comment');
    res.status(500).json({
      success: false,
      error: error,
    });
  }
}

//update a user's comment to a specific comment
async function editComment(req, res) {
  if (!ioInstance) {
    const { getIo } = require('../socketServer'); // Lazy import
    ioInstance = getIo(); // Reuse the stored instance
  }
  const id = req.params.postId;
  const { comment_id, text } = req.body;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post Not Found!',
      });
    }

    //finding specific comment
    const targetedComment = post.comments.find(
      (comment) => comment._id.toString() === comment_id
    );

    if (!targetedComment) {
      return res.status(404).json({
        success: false,
        error: 'Comment Not found!',
      });
    }
    //update the comment
    targetedComment.text = text;

    //save the post
    const response = await post.save();
    await response.populate([
      { path: 'author' },
      { path: 'likes' },
      { path: 'comments.user' },
    ]);

    if (response) {
      // Emit event
      ioInstance.emit('postInteraction', {
        success: true,
        updatedPost: response,
        isDeleted: false,
      });
    }

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

//delete a comment
async function deleteAComment(req, res) {
  if (!ioInstance) {
    const { getIo } = require('../socketServer'); // Lazy import
    ioInstance = getIo(); // Reuse the stored instance
  }
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post Not Found!',
      });
    }

    //removing the specific comment
    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );

    //saving the post
    const response = await post.save();
    await response.populate([
      { path: 'author' },
      { path: 'likes' },
      { path: 'comments.user' },
    ]);

    if (response) {
      // Emit event
      ioInstance.emit('postInteraction', {
        success: true,
        updatedPost: response,
        isDeleted: false,
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

module.exports = {
  createAPost,
  getAllPosts,
  updateAPost,
  deleteAPost,
  handleLikeAndNotify,
  getSpecificPostDetails,
  addCommentToAPost,
  editComment,
  deleteAComment,
};
