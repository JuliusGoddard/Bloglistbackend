const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    const Likes = blogs.map(b => b.likes)
    
    const sumOfLikes = Likes.reduce((a, b) => a + b, 0)

    return sumOfLikes
}

const mostLikes = (blogs) => {
    const res = Math.max.apply(Math,blogs.map(function(o){return o.likes;}))

    const obj = blogs.find(function(o){ return o.likes == res; })

    console.log(obj)

    delete obj.__v
    delete obj._id
    delete obj.url

    
    return obj

}

const mostBlogs = (blogs) => {
const authors = blogs.map(b => b.author)

const mostpopularauthor = authors.sort((a,b) =>
authors.filter(v => v===a).length
- authors.filter(v => v===b).length
).pop();

const allposts = blogs.filter(b => b.author === mostpopularauthor)

return {
    author: mostpopularauthor,
    blogs: allposts.length
}
}

const mostLikesPerAuthor = (blogs) => {

    let authorLikes = blogs.reduce((op, {author, likes}) => {
        op[author] = op[author] || 0
        op[author] += likes
        return op
      },{})
      let mostLikes = Object.keys(authorLikes).sort((a,b)=> authorLikes[b] - authorLikes[a])[0]
      
      const allposts = blogs.filter(b => b.author === mostLikes)

      const likes = allposts.map(l => l.likes)

      const sumoflikes =  likes.reduce((a, b) => a + b, 0)

      return {
          author: mostLikes,
          likes: sumoflikes
      }
}
  
  module.exports = {
    dummy,
    totalLikes,
    mostLikes,
    mostBlogs,
    mostLikesPerAuthor,
  }