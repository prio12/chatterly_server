const Story = require('../models/storiesModel');

//create a new story of a specific user
async function addANewStory(req, res) {
  //creating new story using Story Model
  const newStory = new Story(req.body);
  //   saving in db
  try {
    const response = await newStory.save();
    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Side Error!',
    });
  }
}

module.exports = {
  addANewStory,
};
