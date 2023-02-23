const express = require("express")
const app = express()
const sanitizeHTML = require("sanitize-html")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
dotenv.config({ path: "./config/config.env" })

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(cookieParser())

app.use("/", require("./router"))

// catch incorrect json format
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ code: "AA88" })
  }
  next()
})

// catch incorrect passing of parameters
app.use((req, res, next) => {
  try {
    decodeURIComponent(req.path)
  } catch (e) {
    return res.status(400).json({ code: "AA99" })
  }
  next()
})

// catch all missing routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    code: "AA99"
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server started on port ${process.env.PORT} in ${process.env.NODE_ENV}mode`)
})

const server = require("http").createServer(app)
const io = require("socket.io")(server, {
  pingTimeout: 30000,
  cors: true
})

io.on("connection", function (socket) {
  socket.on("chatFromBrowser", function (data) {
    try {
      let user = jwt.verify(data.token, process.env.JWTSECRET)
      socket.broadcast.emit("chatFromServer", { message: sanitizeHTML(data.message, { allowedTags: [], allowedAttributes: {} }), username: user.username, avatar: user.avatar })
    } catch (e) {
      console.log("Not a valid token for chat.")
    }
  })
})

module.exports = server
