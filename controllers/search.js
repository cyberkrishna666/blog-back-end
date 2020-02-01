const searchRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

searchRouter.post('/', async ( request, response, next ) => {
  // const body = request.body
  // const itemsPerPage = 5
  const searchQuery = request.query.q
  const authorQuery = request.query.author
  // const pageNumber = Number(body.page)

  if ( authorQuery ) {
    try {
      const userFound = await User.find({ username: authorQuery })
      const postsFound = await Blog.find({ user: userFound }).populate('user', { _id: 1, username: 1 }).populate('usersLiked', { user: 1, _id: 1 }).populate({ path: 'comments', populate: {
        path: 'user',
        select: 'username',
        model: 'User'
      } })

      response.status(200).json(postsFound)
    } catch (error) {
      next(error)
    }
  }

  try {
    // response.json({ query: request.query.q })
    const postsFound = await Blog.find({ 'title': { '$regex': searchQuery, '$options': 'i'} })
    // const totalPages = Math.ceil(postsFound.length / itemsPerPage)

    // if ( pageNumber === 1 ) {
    //   const postsSliced = postsFound.slice( pageNumber - 1, itemsPerPage )

    //   response.status(200).json({ firstPage: postsSliced, totalPages: totalPages})
    // }

    // if ( pageNumber > 1 ) {
    //   const postsSliced = postsFound.slice( ((pageNumber * itemsPerPage) - itemsPerPage), ( pageNumber * itemsPerPage ))

    //   response.status(200).json(postsSliced)
    // }

    response.status(200).json(postsFound)
  } catch (error) {
    next(error)
  }
})

module.exports = searchRouter