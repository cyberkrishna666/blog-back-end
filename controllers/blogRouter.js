const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Like = require('../models/like')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const destinationAdress = '/uploads/img/avatar/'
const storage = multer.diskStorage({
  destination: '.' + destinationAdress,
  filename: function ( req, file, cb ) {
    cb(null, file.originalname)
  }
})
let upload = multer({storage: storage})


blogRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { _id: 1, username: 1 }).populate('usersLiked', { user: 1, _id: 1 }).populate({ path: 'comments', populate: {
      path: 'user',
      select: 'username',
      model: 'User'
    } })

    console.log(blogs)

    response.json(blogs)

  } catch (exception) {
    next(exception)
  }
})

blogRouter.get('/mostliked', async ( request, response, next ) => {
  const QUANTITY = 3

  try {
    const blogs = await Blog.find({}).populate('user', { _id: 1, username: 1 })

    const temp = blogs.map( post => {
      const jsonObj = JSON.stringify(post)
      const result = JSON.parse(jsonObj)
      return result
    })
      
    temp.forEach( post => {
      post.likes = post.usersLiked.length
    })

    temp.sort( ( post, nextPost ) => nextPost.likes - post.likes)

    const mostLiked = temp.slice( 0, QUANTITY)

    response.json(mostLiked)
  } catch (error) {
    next(error)
  }
})
  
blogRouter.post('/', upload.single('image'), async (request, response, next) => {
  const body = request.body
  let image = null
  let user = null

  if (request.file) {
    image = request.file.originalname
  }
  
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    user = await User.findById(decodedToken.id)
  } catch (exception) {
    next(exception)
  }

  const post = new Blog({
    title: body.title,
    preview: body.preview,
    content: body.content,
    date: new Date(),
    tags: body.tags,
    image: image ? destinationAdress + image : 'noimage',
    user: user._id
  })

  try {
    const savedPost = await post.save()
    user.posts = user.posts.concat(savedPost._id)
    await user.save()

    // const populatedSavedPost = await Blog.find(savedPost).populate('user', { _id: 1 })

    response.status(201).json({ postUrl: `@${user.username}/${savedPost._id}` })
  } catch (exception) {
    next(exception)
  }
})

blogRouter.delete('/:id', async ( request, response, next ) => {
  let user = null
  let post = null
  let likes = []

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    user = await User.findById(decodedToken.id)
    post = await Blog.findById(request.params.id)
    likes = await Like.find({ 'post': post._id }).populate('user', { _id: 1 })

  } catch (exception) {
    next(exception)
  }

  if (likes.length) {
    try {
      likes.forEach( async (like) => {
        let user = await User.findById(like.user)
        await user.likedPosts.remove(like._id)
        await user.save()
        await user.posts.remove(post._id)
        await user.save()
        console.log(`Like for post "${post.title}" is deleted from user "${user.username}"`)
      })

      await Like.deleteMany({ 'post': post._id })

    } catch (exception) {
      next(exception)
    }
  }


  try {
    if (!post) {
      response.status(404).json({ error: 'resource not found'})
    }
    if ( post.user.toString() === user.id.toString() ) {
      post.remove()
      response.status(204).end()
    } else {
      response.status(401).end()
    }
  } catch (exception) {
    next(exception)
  }
})

blogRouter.get('/:id', async (request, response, next) => {
  try {
    const post = await Blog.findById(request.params.id).populate('user', { _id: 1, username: 1 }).populate('usersLiked', { user: 1, _id: 1 }).populate({ path: 'comments', populate: {
      path: 'user',
      select: 'username',
      model: 'User'
    } })
    
    if (post) {
      response.json(post.toJSON())
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }
})

blogRouter.put('/:id', async ( request, response, next ) => {
  try {
    const post = request.body

    const newPost = {
      title: post.title,
      preview: post.preview,
      content: post.content,
      tags: post.tags
    }

    const updatedPost = await Blog.findByIdAndUpdate( request.params.id, newPost, { new: true } )

    response.json(updatedPost.toJSON())
  } catch (error) {
    next(error)
  }
})

blogRouter.put('/:id/like', async ( request, response, next ) => {
  let user = null
  let post = null

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    user = await User.findById(decodedToken.id)
    post = await Blog.findById(request.params.id)
  } catch(exception) {
    next(exception)
  }

  const like = new Like ({
    post: post._id,
    user: user._id
  })

  try {
    const savedLike = await like.save()

    user.likedPosts = user.likedPosts.concat(savedLike._id) 
    await user.save()

    post.usersLiked = post.usersLiked.concat(savedLike._id) 
    await post.save()

    response.status(201).json(savedLike.toJSON())
  } catch (exception) {
    next(exception)
  }
})

blogRouter.delete('/:id/like', async ( request, response, next ) => {
  let user = null
  let post = null
  let like = null

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    user = await User.findById(decodedToken.id)
    post = await Blog.findById(request.params.id)
    like = await Like.findOne({ user: user._id, post: post._id })

  } catch(exception) {
    next(exception)
  }

  try {
    const removedLike = await Like.findByIdAndRemove(like._id)
    console.log('Like document is removed')

    await user.likedPosts.remove(like._id)
    await user.save()
    console.log('Like removed from user')

    await post.usersLiked.remove(like._id)
    await post.save()
    console.log('Like removed from post')

    response.status(200).json(removedLike)
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogRouter
