// external imports
const { Server } = require('socket.io');
const { handleLikeAndNotify } = require('./controllers/postsController');

//storing io instance to get access from other files
let io;
// Store connected users
const users = new Map();

//initializeSocket  server
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173/',
    },
  });

  io.on('connection', (socket) => {
    // Register user when they connect using user specific firebase uid
    socket.on('register', (currentUser) => {
      users.set(currentUser, socket.id);
    });

    // Handle like event (updating likes) and notification saving event in db
    socket.on('liked', ({ userId, postId, action, authorUid }, callback) => {
      handleLikeAndNotify({ userId, postId, action, authorUid, callback });
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
