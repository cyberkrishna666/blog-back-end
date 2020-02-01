const totalLikes = require('../utils/list_helper').totalLikes

describe('total likes', () => {
  const listWithOneBlog = [
    {
      x: 1,
      likes: 5
    }
  ]

  test('of total likes', () => {
    expect(totalLikes(listWithOneBlog)).toBe(5)
  })
})