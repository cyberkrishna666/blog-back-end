const config = require('./utils/config')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const blogRouter = require('./controllers/blogRouter')
const usersRouter = require('./controllers/users')
const userLogin = require('./controllers/login')
const commentsRouter = require('./controllers/comment')
const searchRouter = require('./controllers/search')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const { static } = require('express')

console.log('commecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then( () => {
    logger.info('connected to MongoDB')
  })
  .catch( (error) => {
    logger.info('error connecting to MongoDB:', error.message)
  })
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

app.use(cors())
app.use('/uploads/img/posts/', static('./uploads/img/posts/'))
app.use(bodyParser.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/blogs', blogRouter)
app.use('/users', usersRouter)
app.use('/login', userLogin)
app.use('/comments', commentsRouter)
app.use('/search', searchRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
