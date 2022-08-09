require('dotenv').config()
const app = require('./app')
const http = require('http')
const logger = require('./utils/logger')
const config = require('./utils/config')

const server = http.createServer(app)

const PORT = process.env.PORT
server.listen(PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})