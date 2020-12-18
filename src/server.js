//---------------------Require
const express = require("express")
const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling")

//Routes
const mediaRoutes = require("./services/media")

//---------------------Instances
const server = express()

//-----------------------Use
server.use(express.json())

server.use("/media", mediaRoutes)

//use error handlers
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(forbiddenErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(catchAllErrorHandler)

//---------------------Listen
const port = process.env.PORT || 3001
server.listen(port, () => console.log("server created on port", port))
