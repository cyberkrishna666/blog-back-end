const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach( async () => {
  await Blog.deleteMany({})

  const posts = helper.initialBlogs.map( post => new Blog(post))
  const promiseArray = posts.map( post => post.save() )
  await Promise.all(promiseArray)
})

test('notes are returned as json', async () => {
  await api
    .get('/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})
  
test('there are as many blogs as in init state', async () => {
  const response = await api.get('/blogs')
  
  expect(response.body.length).toBe(helper.initialBlogs.length)
})
  
test('a specific note is within the returned notes', async () => {
  const response = await api.get('/blogs')
  
  const contents = response.body.map(r => r.author)
  
  expect(contents).toContain(
    'Govinda'
  )
})
  
test('a valid note can be added ', async () => {
  const newPost = {
    title: 'MOLYTWA ZA UKRAINU',
    author: 'TATARIN',
    url: '1488.com',
    likes: 155,
  }
  
  await api
    .post('/blogs')
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
  
  const contents = blogsAtEnd.map(n => n.author)
  expect(contents).toContain('TATARIN')
})
  
test('note without content is not added', async () => {
  const newPost = {
    likes: 7
  }
  
  await api
    .post('/blogs')
    .send(newPost)
    .expect(400)
  
  const blogsAtEnd = await helper.blogsInDb()
  
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
})
  
test('a specific note can be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb()
  
  const postToView = blogsAtStart[0]
  
  const resultPost = await api
    .get(`/blogs/${postToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  expect(resultPost.body).toEqual(postToView)
})
  
test('a note can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const postToDelete = blogsAtStart[0]
  
  await api
    .delete(`/blogs/${postToDelete.id}`)
    .expect(204)
  
  const blogsAtEnd = await helper.blogsInDb()
  
  expect(blogsAtEnd.length).toBe(
    helper.initialBlogs.length - 1
  )
  
  const contents = blogsAtEnd.map(r => r.title)
  
  expect(contents).not.toContain(postToDelete.title)
})

test('all posts have id property', async () => {
  const newPost = {
    title: 'MOLYTWA ZA UKRAINU',
    author: 'TATARIN',
    url: '1488.com',
    likes: 155,
  }
      
  await api
    .post('/blogs')
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)
      
  const blogsMutated = await helper.blogsInDb()
  expect(blogsMutated.length).toBe(helper.initialBlogs.length + 1)

  const postToView = blogsMutated[helper.initialBlogs.length]
  expect(postToView.id).toBeDefined()

})

test('new post\'s likes property is set to 0 (zero)', async () => {
  const newPost = {
    title: 'POST WITHOUT INITIAL LIKES',
    author: 'DAFAULTS TO ZERO',
    url: '000',
  }
  
  await api
    .post('/blogs')
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
  
  const postToView = blogsAtEnd[helper.initialBlogs.length]
  expect(postToView.likes).toBe(0)
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'cyberkrishna',
      name: 'Ivan Holovin',
      password: 'sobaka',
    }

    await api
      .post('/users/')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)

    expect(usernames).toContain(newUser.username)
  })
})
  
afterAll(() => {
  mongoose.connection.close()
})