// external imports
const { Server } = require('socket.io');
const { handleLikeAndNotify } = require('./controllers/postsController');
const {
  handleUserOnline,
  handleMessageSeenBy,
} = require('./controllers/socketEventsController');

//storing io instance to get access from other files
let io;
// Store connected users
const users = new Map();

//initializeSocket  server
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
    },
  });

  io.on('connection', (socket) => {
    // Register user when they connect using user specific firebase uid
    let registeredUser = null; //to keep track of the registered user , it will help to remove a specific user from users map
    socket.on('register', async (currentUser) => {
      users.set(currentUser, socket.id);
      registeredUser = currentUser;

      // Handle "delivered" update when user comes online
      await handleUserOnline(currentUser, io);
      //notify all users about active user's update
      io.emit('usersUpdated');
    });

    // Handle like event (updating likes) and notification saving event in db
    socket.on('liked', ({ userId, postId, action, authorUid }, callback) => {
      handleLikeAndNotify({ userId, postId, action, authorUid, callback });
    });

    //Remove the user's uid from users map when a specific user disconnects
    socket.on('disconnect', () => {
      users.delete(registeredUser);

      //notify all users about active user's update
      io.emit('usersUpdated');
    });

    //listening to the event activeConnections to find out activeFriends
    socket.on('activeConnections', (friendsUid, callback) => {
      const activeConnectionsUid = friendsUid.filter((uid) => users.has(uid));
      callback(activeConnectionsUid);
    });

    //listening to the joinConversation event to create a room for conversation
    socket.on('joinedRoom', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leaveRoom', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('messagesRead', async ({ conversationId, userId }) => {
      if (!conversationId || !userId) return;
      await handleMessageSeenBy({ conversationId, userId, io });
    });

    socket.on('typing', ({ receiver, sender }) => {
      const receiverSocketId = users.get(receiver.uid);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { userId: sender });
      }
    });
    socket.on('stopTyping', ({ receiver, sender }) => {
      const receiverSocketId = users.get(receiver.uid);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStopTyping', { userId: sender });
      }
    });
  });
};

//getter function to get io instance
const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// getter function to get stored Users
const getUsers = () => {
  return users;
};

module.exports = {
  initializeSocket,
  getIo,
  getUsers,
};
