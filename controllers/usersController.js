const User = require('../models/usersModel');

//post all users when signs up
async function addNewUser(req, res, next) {
  const user = new User(req.body);
  //saving the user to db
  try {
    const result = await user.save();
    res.status(200).json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unknown error occurred!',
    });
  }
}

module.exports = {
  addNewUser,
};
