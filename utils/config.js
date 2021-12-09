//定义环境变量的值,使用env里的环境变量
require('dotenv').config()

const PORT = process.env.PORT||3003

const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT
}