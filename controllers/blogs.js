const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/',async (request, response) => {
  const blogs=await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/',async (request, response,next) => {
  const blog = new Blog(request.body)

  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user=await User.findById(decodedToken.id)

  if(blog.likes===undefined)
  {
    blog.likes=0
  }
  else if(blog.url===undefined||blog.title===undefined)
  {
    return response.status(400).json({ error: "title or url is missing" })
  }
  blog.user=user._id

  const saveBlog=await blog.save()
  user.blogs=user.blogs.concat(saveBlog._id)
  await user.save()

  response.json(saveBlog)
})
blogsRouter.delete("/:id",async(request,response) => {
	const token = request.token

	const decodedToken = jwt.verify(token,process.env.SECRET)
	if(!token || !decodedToken){
		return response.status(401).json({
			error: "token missing or invalid"
		})
	}

	const id = request.params.id
	const blog = await Blog.findById(id)
	if(blog.user.toString() === decodedToken.id){
		await Blog.findByIdAndDelete(id)
		response.status(204).end()
	}
	else{
		return response.status(401).json({
			error: "Unauthorized to access the blog"
		})
	}
})

blogsRouter.patch("/:id", async(request,response) => {
	const id = request.params.id

	if(request.body.likes){
		const blog = {
			likes : request.body.likes
		}
		const updatedBlog = await Blog.findByIdAndUpdate(id,blog,{ new : true })
		response.json(updatedBlog)
	}
	else{
		response.status(400).send({ error: "Likes property is missing" })
	}
})
blogsRouter.post("/:id/comments",async(request,response) => {
	const id = request.params.id

	if(request.body.comment){
		const blog = await Blog.
			findByIdAndUpdate(id,{ ["$addToSet"]: { comments: request.body.comment } },
				{ new : true }
			)
		response.json(blog)
	}
	else{
		response.status(400).send({ error: "Comment is missing" })
	}
})
module.exports = blogsRouter