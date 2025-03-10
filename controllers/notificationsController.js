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

  const notificationSender = user.name;

  //checking if the author of the post (who will get notification) is online with socketId
  const authorSocketId = users.get(authorUid);
  if (authorSocketId) {
    io.to(authorSocketId).emit('likedNotification', savedNotification);
  }
}

//get a user's specific notifications by _.id
async function getUserSpecificNotifications(req, res) {
  console.log(req.params.id);
}

module.exports = {
  handleLikedNotification,
  getUserSpecificNotifications,
};
