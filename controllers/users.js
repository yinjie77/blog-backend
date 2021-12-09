const bcrypt=require('bcryptjs')//生成密码哈希值
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()
  .catch(error=>{
    response.status(400).json({
        error: error.message 
      })
  })

  response.json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User
  .find({}).populate('blogs',{title:1,author:1,url:1,likes:1})
    response.json(users)
  })
  // populate 方法是 find 方法这一初始查询方法后的一个链式调用。populate 方法的入参，定义了存储在 User 中的 Blog id， 这些 id 指向了 blogs Collection 的 blog，而这些 id 也会被真实的 blog 所替代。
module.exports = usersRouter