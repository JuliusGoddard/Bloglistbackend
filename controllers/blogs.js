const blogsRouter = require('express').Router()
const { getNextKeyDef } = require('@testing-library/user-event/dist/keyboard/getNextKeyDef')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}
 
blogsRouter.get('/', (request, response) => {
    Blog
      .find({}).populate('user', {username: 1, name: 1})
      .then(blogs => {
        response.json(blogs)
      })
  })
  
blogsRouter.get('/:id', async (request, response) => {
      const blog = await Blog.findById(request.params.id).populate('user', {username: 1, name: 1}, ('comments', {commenter: 1, comment: 1}))
      if (blog) {
        response.json(blog.toJSON())
      } else {
        response.status(404).end()
      }
  
  })


blogsRouter.post('/', async (request, response, next) => {
    const body = request.body

    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
  
  if (body.title === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  if (body.author === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }


  const newblog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user._id  })

    const savedBlog = await newblog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.json(savedBlog)

  })

  blogsRouter.post('/:id/comments', async (request, response, next) => {
  try {
    const body = request.body

  const blog = await Blog.findById(request.params.id)

  if (blog) {
    blog.comments.push(body.comment)
   const savedBlog  = await blog.save()
 response.status(200).json(savedBlog.toJSON());
  }

  } catch (exception) {
    next(exception)
  }})

blogsRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }
  try {
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === decodedToken.id.toString()) {
      await blog.remove()
      response.status(204).end()
    } else {
      response.status(401).end()
    }
  } catch (exception) {
    next(exception)
  }
  })

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    /* const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({
        error: 'token missing or invalid'
      })
    }

    const user = await User.findById(decodedToken.id) */
  
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      user: body.user._id,
      likes: body.likes
    }
  
    const savedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(savedBlog)
  })
  

  module.exports = blogsRouter