//post all users when signs up
async function postAllUsers(req, res, next) {
  console.log(req.body);
}

async function getAllUsers(req, res, next) {
  res.send('hello from get all routes');
}

module.exports = {
  postAllUsers,
  getAllUsers,
};
