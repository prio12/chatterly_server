// external imports
const { Server } = require('socket.io');
const { handleLikeAndNotify } = require('./controllers/postsController');

//initializeSocket  server

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173/',
    },
  });

  // Store connected users
  const users = new Map();

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

  return io;
};

module.exports = initializeSocket;
