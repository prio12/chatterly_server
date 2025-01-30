const User = require('../models/usersModel');

//post every new user when signs up
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

//update any field of a specific user eg:(profile pic, cover photo, bio)
async function updateUserInfo(req, res, next) {
  const query = { uid: req.params.id };
  const updates = {};
  if (req.body.profilePicture) {
    updates.profilePicture = req.body.profilePicture;
  }
  if (req.body.coverPhoto) {
    updates.coverPhoto = req.body.coverPhoto;
  }

  try {
    const user = await User.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }
    console.log(user);
    res.status(200).json({
      message: 'Updated Successfully!',
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Oops!! Server Side Error!',
    });
  }
}

module.exports = {
  addNewUser,
  updateUserInfo,
};
