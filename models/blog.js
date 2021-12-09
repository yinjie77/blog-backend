const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  comments: [{
		type: String
	}],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})
//格式化返回的对象，删除掉没用的信息
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()//id实际上是对象
    delete returnedObject._id
    delete returnedObject.__v
  }
})

//内部定义外部无法访问
module.exports = mongoose.model('Blog', blogSchema)