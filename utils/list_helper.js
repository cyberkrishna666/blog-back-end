const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const result = blogs.reduce( ( sum, current ) => {
    return sum += current.likes
  }, 0)

  return result
}

const favoriteBlog = (blogs) => {
  let topBlog = blogs[0]

  const result = blogs.reduce( ( max, blog) => {
    if ( blog.likes > max ) {
      max = blog.likes
      topBlog = blog
    }
    return max
  }, 0 )

  return topBlog
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}