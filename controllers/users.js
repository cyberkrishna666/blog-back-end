const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
const Comment = require('../models/comment')
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

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({}).populate('posts', { title: 1, date: 1 })
    response.json(users.map( u => u.toJSON()) )
  } catch (exception) {
    next(exception)
  }
})

usersRouter.post('/avatar/', upload.single('avatar'), async ( request, response, next ) => {
  const avatar = request.file.originalname
  let user = null
  
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    user = await User.findById(decodedToken.id)
  } catch (exception) {
    next(exception)
  }

  user.avatar = destinationAdress + avatar
  await user.save()
  response.status(201)
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    if ( body.password.length < 8 || !body.password ) {
      return response.status(401).json({
        error: 'password must be 8 characters min'
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      lastName: body.lastName,
      passwordHash,
      bio: body.bio,
      role: body.role
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

usersRouter.post('/:id/ban', async (request, response, next) => {
  let userId = request.params.id
  let userIssued = null
  let userToBeBanned = null


  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    userIssued = await User.findById(decodedToken.id)
    userToBeBanned = await User.findById(userId)
  } catch (exception) {
    next(exception)
  }

  async function proceedBan () {
    if ( userIssued.role === 'admin' ) {
      try {
        await Blog.deleteMany({ user: userToBeBanned })
        await Comment.deleteMany({ user: userToBeBanned })
        await Like.deleteMany({ user: userToBeBanned })

        userToBeBanned.role = 'banned'
        await userToBeBanned.save()
        userToBeBanned.posts = []
        await userToBeBanned.save()
        userToBeBanned.likedPosts = []
        await userToBeBanned.save()
        userToBeBanned.comments = []
        await userToBeBanned.save()

        response.status(200).json(userToBeBanned)
      } catch (error) {
        next(error)
      }
    } else {
      response.status(403).end()
    }
  }

  await proceedBan()

})

module.exports = usersRouter