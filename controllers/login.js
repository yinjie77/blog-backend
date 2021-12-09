const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const body = request.body
  
    const user = await User.findOne({ username: body.username })

    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)//由于 password 在数据库中并不是明文存储的，而是存储的通过 password 计算的 Hash 值
  
    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: 'invalid username or password'
      })
    }
  
    const userForToken = {
      username: user.username,
      id: user._id,
    }
    // const token = jwt.sign(userForToken,process.env.SECRET)
    const token = jwt.sign(
        userForToken, 
        process.env.SECRET,
        { expiresIn: 60*60 }
      )
  
    response
      .status(200)
      .send({ token, username: user.username, name: user.name ,id:user.id})
  })
  
  module.exports = loginRouter