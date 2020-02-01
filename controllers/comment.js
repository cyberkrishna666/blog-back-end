const commentsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const jwt = require('jsonwebtoken')

commentsRouter.post('/:id/add/', async (request, response, next) => {
  const body = request.body
  let user = null
  let post = null
  let comment = null

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    user = await User.findById(decodedToken.id)
    post = await Blog.findById(request.params.id)
    comment = new Comment({
      post: post._id,
      user: user._id,
      commentContent: body.commentContent,
      date: new Date()
    })
  } catch (exception) {
    next(exception)
  }


  try {
    const savedComment = await comment.save()
    post.comments = post.comments.concat(savedComment._id)
    await post.save()
    user.comments = user.comments.concat(savedComment._id)
    await user.save()
    const populatedComment = await Comment.findById(savedComment._id).populate('user', { username: 1 })

    response.status(201).json(populatedComment.toJSON())
  } catch (exception) {
    next(exception)
  }
})

commentsRouter.delete('/:postid/remove/:commentid', async ( request, response, next ) => {
  // let user = null
  // let post = null
  // let comment = null

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    const post = await Blog.findById(request.params.postid)
    const comment = await Comment.findById(request.params.commentid)

    const removedComment = await Comment.findByIdAndRemove(comment._id)
    console.log('Comment document is removed')
  
    await user.comments.remove(comment._id)
    await user.save()
    console.log('Comment removed from user')
  
    await post.comments.remove(comment._id)
    await post.save()
    console.log('Comment removed from post')
  
    response.status(200).json(removedComment)
  } catch (exception) {
    next(exception)
  }
})

module.exports = commentsRouter