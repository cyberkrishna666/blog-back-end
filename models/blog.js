const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5
  },
  preview: {
    type: String,
    required: true,
    minlength: 5
  },
  content: {
    type: String,
    required: true,
    minlength: 10
  },
  date: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  usersLiked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Like',
    }
  ],
  tags : [
    {
      type: String
    }
  ],
  image: String
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
  
const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog