const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  } 
]

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')

  const title = response.body.map(r => r.title)
  expect(title).toContain(
    'React patterns'
  )
})

 test('check if property id exists', async () => {
  const response = await api.get('/api/blogs')
expect(response.body[0].id).toBeDefined()
  
})

describe('Adding new Entry to DB', () => {

  let token = null
  beforeAll(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'jane', passwordHash })

    await user.save()

    // Login user to get token
    await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' })
      .then((res) => {
        return (token = res.body.token)
      })

    return token
  })

test('a valid blog can be added', async () => {

  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  }

  await api
  .post("/api/blogs")
  .set('Authorization', `Bearer ${token}`)
  .send(newBlog)
  .expect(200)
  .expect('Content-Type', /application\/json/)



const blogsAtEnd = await helper.blogsInDb()
expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

const title = blogsAtEnd.map(r => r.title)
expect(title).toContain('Canonical string reduction')
}, 10000)

test('check whether likes is 0', async () => {
  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"
  }

  await api.post('/api/blogs')
  .send(newBlog)
  .set('Authorization', `bearer ${token} `)
  .expect(200)
  .expect('Content-Type', /application\/json/)

const response = await api.get('/api/blogs')

const likes = response.body.map(r => r.likes)

console.log(likes)

expect(likes[likes.length - 1]).toEqual(0)

})


test('check whether a bad request is sent back', async () => {
  const newBlog = {
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"
  }

  await api.post('/api/blogs')
  .send(newBlog)
  .expect(401)

})
})

describe('deletion of a blog', () => {
  let token = null

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'jane', passwordHash })

    await user.save()

    // Login user to get token
    await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' })
      .then((res) => {
        return (token = res.body.token)
      })

    const newBlog = {
      title: 'Another blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    return token
  })

test('deletion of a blog', async () => {

  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    0
  )

  const title = blogsAtEnd.map(r => r.title)

  expect(title).not.toContain(blogToDelete.title)
    
})
})

test('a specific blog can be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb()

  const blogToView = blogsAtStart[0]

  const resultBlog = await api.get(`/api/blogs/${blogToView.id}`)
  .expect(200)
  .expect('Content-Type', /application\/json/)

  const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

  expect(resultBlog.body).toEqual(processedBlogToView)

}) 

test('check if property ID exists', async () => {
  const response = await api.get('/api/blogs')
expect(response.body[0].id).toBeDefined()
  
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
})

test('an invalid username returns the correct error message', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'John',
    name: ''
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  const usersAtEnd = await helper.usersInDb()
  expect(usersAtEnd).toHaveLength(usersAtStart.length)

})

afterAll(() => {
  mongoose.connection.close()
})