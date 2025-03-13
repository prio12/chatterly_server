const Notification = require('../models/notificationsModel');
const { getUsers, getIo } = require('../socketServer');

//like notification controller using socket.io
async function handleLikedNotification({ post, userId, user, authorUid }) {
  //getting all registered users
  const users = getUsers();
  //getting io instance
  const io = getIo();

  //creating a notification using notification Schema
  const notification = new Notification({
    type: 'like',
    recipient: post.author._id.toString(),
    sender: userId,
    post: post._id,
  });

  //saving the notification in db
  const savedNotification = await notification.save();

  //checking if the author of the post (who will get notification) is online with socketId
  const authorSocketId = users.get(authorUid);
  if (authorSocketId) {
    io.to(authorSocketId).emit('likedNotification', savedNotification);
  }
}

//get a user's specific notifications by _.id
async function getUserSpecificNotifications(req, res) {
  const query = { recipient: req.params.id };
  try {
    const response = await Notification.find(query)
      .populate('sender')
      .populate('post')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
}

//handle mark as seen
async function handleMarkAsSeen(req, res) {
  try {
    const response = await Notification.updateMany(
      {
        recipient: req.params.id,
      },
      { seen: true }
    );

    res.status(200).json({
      success: true,
      message: 'Marked as seen successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error!',
    });
  }
}

async function deleteANotification(req, res) {
  try {
    const response = await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Notification Deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error!',
    });
  }
}

module.exports = {
  handleLikedNotification,
  getUserSpecificNotifications,
  handleMarkAsSeen,
  deleteANotification,
};
