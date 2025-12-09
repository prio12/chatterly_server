// external imports
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { createServer } = require('http');

const app = express();
dotenv.config();

const httpServer = createServer(app);

// request parsers
app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

//internal imports
const usersRoute = require('./routers/users');
const postsRoute = require('./routers/posts');
const notificationsRoute = require('./routers/notifications');
const connectionRoute = require('./routers/connections');
const storiesRoute = require('./routers/stories');
const conversationRoute = require('./routers/conversations');
const jwtRoute = require('./routers/jwtRoute');
const { initializeSocket } = require('./socketServer');

//initializeSocket
initializeSocket(httpServer);

//connect to database
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
  } catch (error) {
    console.log(error);
  }
};
connectDatabase();
//root route
//all routes
app.use('/', usersRoute);
app.use('/posts', postsRoute);
app.use('/notifications', notificationsRoute);
app.use('/connections', connectionRoute);
app.use('/stories', storiesRoute);
app.use('/conversations', conversationRoute);
app.use('/jwt', jwtRoute); //jwt route

httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
