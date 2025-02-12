const Post = require('../models/postModel');
const User = require('../models/usersModel');

//creating a new post and saving in db
async function createAPost(req, res) {
  //destructuring from req.body
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(400).json({
      error: 'Content and AuthorId are required',
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

module.exports = {
  createAPost,
};
