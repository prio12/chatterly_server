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
    // Register user when they connect using user specific mongodb _id
    socket.on('register', (_id) => {
      users.set(_id, socket.id);
    });

    // Handle like event (updating likes) and notification saving event in db
    socket.on('liked', ({ userId, postId, action }, callback) => {
      handleLikeAndNotify({ userId, postId, action, callback });
    });
  });
};

//function to get io instance
const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIo,
};
