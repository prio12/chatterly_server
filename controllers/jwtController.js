const generateToken = require('../utils/generateToken');

//post every new user when signs up
async function issueJwtToken(req, res) {
  const userUid = req.body.currentUser;

  //checking if the uid is available
  if (!userUid) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized User!',
    });
  }

  //generating jwt token
  const token = generateToken(userUid);
  console.log(token);
}

module.exports = {
  issueJwtToken,
};
