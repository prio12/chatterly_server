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
app.use(cors());

//internal imports
const usersRoute = require('./routers/users');
const postsRoute = require('./routers/posts');
const initializeSocket = require('./socketServer');

const io = initializeSocket(httpServer);

//connect to database
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
  } catch (error) {
    console.log(error);
  }
};
connectDatabase();

//all routes
app.use('/', usersRoute);
app.use('/posts', postsRoute);

httpServer.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
