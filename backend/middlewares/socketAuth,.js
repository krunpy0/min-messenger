const jwt = require("jsonwebtoken");

module.exports = function socketAuth(io) {
  io.use((socket, next) => {
    const token = (socket.handshake.headers.cookie || "").split(';')
    .map(v => v.trim())
    .find(c => c.startsWith("token"))?.split("=")[1]
  })

  if (!token) return next(new Error("no token"))

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = {id: payload.id, username: payload.username}
    next()
  } catch(err) {
    next(err)
  }
}