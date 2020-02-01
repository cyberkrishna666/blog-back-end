const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    author: 'Govinda',
    title: 'Jaya Jaya',
    url: '666',
    likes: 7
  },
  {
    author: 'Vasyl',
    title: 'Coolowinwonder',
    url: 'lohi.tm',
    likes: 3
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})

  return blogs.map( blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map( user => user.toJSON() )
}

module.exports = {
  initialBlogs, blogsInDb, usersInDb
}