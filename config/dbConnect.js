const mongoose = require('mongoose')

// Connect to MongoDB
const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB Connected')
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

module.exports = dbConnect
