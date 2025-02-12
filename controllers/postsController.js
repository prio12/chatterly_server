const User = require('../models/usersModel');

//creating a new post and saving in db
async function createAPost(req, res) {
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).json({
      message: 'Content and AuthorId are required',
    });
  }
}

module.exports = {
  createAPost,
};
