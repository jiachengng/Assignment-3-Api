const apiRouter = require("express").Router()

const applicationController = require("./controllers/applicationController")

const cors = require("cors")

apiRouter.use(cors())

apiRouter.route("/createTask").post(applicationController.createTask)
apiRouter.route("/getTaskByState").post(applicationController.getTaskByState)
apiRouter.route("/promoteTask2Done").post(applicationController.promoteTask2Done)

module.exports = apiRouter
