require('dotenv').config()
const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan');
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

app.use(middleware.tokenExtractor)

app.use(cors())
app.use(express.static("build"))
app.use(express.json())

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)

app.use(morgan(':method :url :body'));

module.exports = app