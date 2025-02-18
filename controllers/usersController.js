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

//get user Specific info by uid
async function getUserByUid(req, res, next) {
  const query = { uid: req.params.uid };
  console.log(req.params.uid);
  try {
    const user = await User.findOne(query).populate({
      path: 'posts',
      options: { sort: { createdAt: -1 } },
      populate: { path: 'author', select: 'name profilePicture' },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }
    res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Oops!! Server Side Error!',
    });
  }
}

//update any field of a specific user eg:(profile pic, cover photo, bio)
async function updateUserInfo(req, res, next) {
  //defining allowed updates
  const allowedUpdateFields = [
    'name',
    'profilePicture',
    'coverPhoto',
    'bio',
    'birthDate',
    'profession',
    'relationshipStatus',
    'location',
    'gender',
  ];
  const query = { uid: req.params.uid };
  const updates = {};

  //checking if the updates from the client exist in allowed updates and setting up the updates obj
  for (const field of allowedUpdateFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
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
  getUserByUid,
};
