const maxLikes = require('../utils/list_helper').favoriteBlog

describe('post with max likes', () => {
  const blogs = [
    {
      x: 1,
      likes: 0
    },
    {
      x:2,
      likes: 7
    },
    {
      x:3,
      likes: 1
    }

  ]

  test('of max likes post', () => {
    expect(maxLikes(blogs)).toStrictEqual({
      x:2,
      likes: 7
    })
  })
})