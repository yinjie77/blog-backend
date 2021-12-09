const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Blog = require('../models/blog')
const helper=require('../utils/list_helper')
const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  }
]
beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()

})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test("verify GET /api/blogs sanity", async () => {
	const response = await api
		.get("/api/blogs")
		.expect(200)
		.expect("Content-Type",/application\/json/)

    // console.log(response.body[0])
	expect(response.body[0].id).toBeDefined()
	expect(response.body[0]._id).toBe(undefined)
},100000)

test("verify POST /api/blogs adding a blog", async () => {
	const loginUser = {
		"username" : "tester",
		"password": "testing"
	}
	const loggedUser = await api
		.post("/api/login")
		.send(loginUser)
		.set("Accept","application/json")
		.expect("Content-Type",/application\/json/)

	const blog = {
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 9
	}
	await api
		.post("/api/blogs")
		.send(blog)
		.set("Authorization",`Bearer ${loggedUser.body.token}`)
		.set("Accept","application/json")
		.expect("Content-Type",/json/)
		.expect(201)

	const blogs = await helper.getBlogsInDB()
	const titles = blogs.map((blog) => blog.title)
	expect(titles).toContain("TDD harms architecture")
	expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
})

test("if likes not exist,set it became zero",async()=>{
  const newblog={
    title: "test",
    author: "yinjie",
    url: "qqqq",
  }

  const response=await api
  .post('/api/blogs')
  .send(newblog)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)

},100000)

test("verify if the POST /api/blogs requires title and url in the body", async () => {

	const blog = {
		author: "Robert C. Martin",
		likes: 9
	}
	const response = await api
		.post("/api/blogs")
		.send(blog)
		.expect(400)

	expect(response.body.error).toBe("title or url is missing")
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
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})

// npm test -- -t "verify POST /api/blogs adding a blog"