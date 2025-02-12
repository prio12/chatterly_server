// external imports
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
dotenv.config();

// request parsers
app.use(express.json());
app.use(cors());

//internal imports
const usersRoute = require('./routers/users');
const postsRoute = require('./routers/posts');

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

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
