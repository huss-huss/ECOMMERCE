const mongoose = require('mongoose')

const validateMongodbId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id)
  if (!isValid) {
    throw new Error('This is not a valid id or the id does not exist')
  }
}

module.exports = validateMongodbId
