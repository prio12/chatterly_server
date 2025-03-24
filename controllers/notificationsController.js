const Notification = require('../models/notificationsModel');
const { getUsers, getIo } = require('../socketServer');

//like notification controller
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
    io.to(authorSocketId).emit('notification', savedNotification);
  }
}

//connection Request notification controller
async function handleConnectionRequestNotification({
  recipientUid,
  recipient,
  requester,
}) {
  //getting all registered users
  const users = getUsers();

  //getting io instance
  const io = getIo();

  //creating a notification using notification Schema
  const notification = new Notification({
    type: 'connection_request',
    recipient: recipient,
    sender: requester,
  });

  try {
    //saving new notification in db
    const savedNotification = await notification.save();

    //checking if the author of the post (who will get notification) is online with socketId
    const notificationRecipientSocketId = users.get(recipientUid);
    if (notificationRecipientSocketId) {
      io.to(notificationRecipientSocketId).emit(
        'notification',
        savedNotification
      );
    }
  } catch (error) {}
}

//handling comment notification
async function handleCommentNotification({
  authorId,
  post,
  userId,
  authorUid,
}) {
  if (authorId !== userId) {
    //getting all registered users (registered with userUid)
    const users = getUsers();

    //get io instance
    const io = getIo();

    //creating a new Notification  using notification schema
    const newNotification = new Notification({
      type: 'comment',
      recipient: post.author._id.toString(),
      sender: userId,
      post: post._id,
    });

    try {
      //save notification
      const savedNotification = await newNotification.save();

      //checking if the author of the post (who will get notification) is online with socketId
      const authorSocketId = users.get(authorUid);
      if (authorSocketId) {
        io.to(authorSocketId).emit('notification', savedNotification);
      }
    } catch (error) {
      console.log(error);
    }
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

//handle mark as read
async function handleMarkAsRead(req, res) {
  const _id = req.params.id;
  const update = { read: true };

  try {
    const notification = await Notification.findById(_id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found!',
      });
    }
    const response = await Notification.findByIdAndUpdate(_id, update);
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
  handleMarkAsRead,
  handleCommentNotification,
  handleConnectionRequestNotification,
};
