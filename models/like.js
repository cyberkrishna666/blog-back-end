const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const likeSchema = mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

likeSchema.index({ 'post': 1, 'user': 1 }, { unique: true })

likeSchema.plugin(uniqueValidator)

likeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    //returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
  
const Like = mongoose.model('Like', likeSchema)

module.exports = Like