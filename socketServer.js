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
    let registeredUser = null; //to keep track of the registered user , it will help to remove a specific user from users map
    socket.on('register', (currentUser) => {
      users.set(currentUser, socket.id);
      registeredUser = currentUser;

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
