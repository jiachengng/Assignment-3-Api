const sql = require("../config/database")
const GetAppRnumber = require("../getAppRnumber")
const Login = require("../login")
const CheckGroup = require("../checkGroup")
const GetPermits = require("../getPermits")
const e = require("express")
const { sendEmail, getEmail } = require("../sendEmail")

exports.createTask = async (req, res, result) => {
  try {
    console.log("==============================================================")
    console.log("Starting backend API: createTask()")
    // Validate request
    if (!req.body || req.body == "" || req.body == null) {
      res.status(200).send({
        code: "CT99"
      })
    }
    // Login, no user/pw, wrong user/pw, return error code
    var login = await Login(req.body.username, req.body.password)
    if (login == false) {
      return res.status(200).send({
        // success: false,
        code: "CT01"
      })
    }
    if (typeof req.body.applicationName !== "string" || req.body.applicationName == "" || req.body.applicationName == undefined || req.body.applicationName == null || req.body.applicationName.trim() == "" || req.body.applicationName.trim() == null) {
      return res.status(200).send({
        // success: false,
        code: "CT02"
      })
    }
    if (typeof req.body.taskName !== "string" || req.body.taskName == "" || req.body.taskName == undefined || req.body.taskName == null || req.body.taskName.trim() == "" || req.body.taskName.trim() == null || req.body.taskName.length > 45 || typeof req.body.taskDescription !== "string") {
      return res.status(200).send({
        // success: false,
        code: "CT03"
      })
    }

    // get all permits from application
    // var permitCreate
    // sql.query(`SELECT App_permit_Open,App_permit_toDoList,App_permit_Doing,App_permit_Done,App_permit_Create FROM application WHERE App_Acronym = '${req.body.applicationName}'`, async (err, result) => {
    //   if (err) {
    //     return res.status(200).send({
    //       // success: false,
    //       code: "CT02"
    //     })
    //   } else {
    //     //get permitCreate
    //     permitCreate = result.App_permit_Create
    //     console.log("PermitCreate: " + permitCreate)
    //   }
    // })

    var permitCreate = await GetPermits(req.body.applicationName)
    if (permitCreate == false) {
      return res.status(200).send({
        // success: false,
        code: "CT02"
      })
    } else {
      console.log("PermitCreate: ")
      console.log(permitCreate[0].App_permit_Create)
      permitCreate = permitCreate[0].App_permit_Create
    }

    //checkgroup() to see if user belongs in permitcreate's group
    var inPermitCreate = await CheckGroup(req.body.username, permitCreate)
    if (inPermitCreate == true) {
      console.log("User in permit create")
    } else {
      //user does not have permitcreate
      return res.status(200).send({
        code: "CT01"
      })

      // console.log("User not in permit create")
    }

    // console.log("App name: " + req.body.applicationName)
    var appRnumber = await GetAppRnumber(req.body.applicationName)
    if (appRnumber == "no such appName") {
      return res.status(200).send({
        // success: false,
        code: "CT02"
      })
    }
    // console.log("R number: ")
    // console.log(appRnumber[0])
    var newRnumber = appRnumber[0].App_Rnumber + 1
    var taskId = req.body.applicationName + "_" + newRnumber
    // if (req.body.taskDescription == "" || req.body.taskDescription == null) {
    //   return res.status(200).send({
    //     success: false,
    //     message: "Description cannot be empty"
    //   })
    // }
    // if (req.body.taskDescription == "" || req.body.taskDescription == null) {
    //   return res.status(200).send({
    //     success: false,
    //     message: "Description cannot be empty"
    //   })
    // }
    var m = new Date()
    var dateString = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2)

    // var taskNote = "[" + req.body.taskCreator + "] created the task. [" + dateString + "]"
    // if (req.body.taskNotes != "") {
    //   var newNote = "[" + req.body.taskCreator + "] added a new note: " + req.body.taskNotes + " [" + dateString + "]"
    //   taskNote = newNote + "\n" + taskNote
    // }
    var taskNote = "[" + req.body.username + "] created the task. [" + dateString + "]"

    // var taskPlan = null
    // if (req.body.plan != "") {
    //   taskPlan = req.body.plan
    // }
    var newTask = {
      Task_id: taskId,
      Task_name: req.body.taskName,
      Task_description: req.body.taskDescription,
      Task_notes: taskNote,
      // Task_plan: taskPlan,
      Task_app_Acronym: req.body.applicationName,
      Task_state: "open",
      Task_creator: req.body.username,
      Task_owner: req.body.username,
      Task_createDate: new Date("2021-01-01")
    }
    console.log("creating task....")
    sql.query("INSERT INTO task SET ?", newTask, (err, result) => {
      if (err) {
        console.log("other errror")
        console.log(err)
        if (err.code === "ER_DUP_ENTRY") {
          console.log("DUP ENTRY")
          res.status(200).send({
            success: true,
            message: "Task id already exist in Database"
          })
        }
      } else {
        // console.log("else....")
        // console.log(result)
        sql.query(`UPDATE application SET App_Rnumber = '${newRnumber}' WHERE App_Acronym = '${req.body.applicationName}'`, (err, result) => {})
        res.status(200).send({
          // success: true,
          // results: result.length,
          // // requestMethod: req.requestMethod,
          // data: result,
          // message: "Task Created",
          // newTask
          code: "CT00",
          task_id: taskId
        })
        // console.log(result)
        console.log("created task: ", { id: res.insertId, ...newTask })
        // console.log(success)
      }
      // console.log("created account: ", { id: res.insertId, ...newAccount })
      // result(null, { id: res.insertId, ...newAccount })
    })
  } catch (e) {
    res.status(200).send({
      code: "CT99"
    })
  }
}

exports.getTaskByState = async (req, res, result) => {
  try {
    console.log("==============================================================")
    console.log("Starting backend API: getTaskByState()")
    // Validate request
    if (!req.body || req.body == "" || req.body == null) {
      res.status(200).send({
        code: "GT99"
      })
    }
    // Login, no user/pw, wrong user/pw, return error code
    var login = await Login(req.body.username, req.body.password)
    if (login == false) {
      return res.status(200).send({
        // success: false,
        code: "GT01"
      })
    }
    if (typeof req.body.applicationName !== "string" || req.body.applicationName == "" || req.body.applicationName == undefined || req.body.applicationName == null || req.body.applicationName.trim() == "" || req.body.applicationName.trim() == null) {
      return res.status(200).send({
        // success: false,
        code: "GT02"
      })
    }
    var count
    sql.query(`SELECT COUNT(*) AS count FROM application WHERE App_Acronym = ?`, req.body.applicationName, async (err, result) => {
      if (err) {
        return res.status(200).send({
          // success: false,
          code: "GT02"
        })
      } else {
        count = result
        console.log("Count: ")
        console.log(count[0].count)

        if (count[0].count < 1) {
          return res.status(200).send({
            // success: false,
            code: "GT02"
          })
        }

        if (typeof req.body.taskState !== "string" || req.body.taskState == "" || req.body.taskState == undefined || req.body.taskState == null || req.body.taskState.trim() == "" || req.body.taskState.trim() == null) {
          return res.status(200).send({
            // success: false,
            code: "GT03"
          })
        }
        if (req.body.taskState.toLowerCase() !== "open" && req.body.taskState.toLowerCase() !== "todo" && req.body.taskState.toLowerCase() !== "doing" && req.body.taskState.toLowerCase() !== "done" && req.body.taskState.toLowerCase() !== "close") {
          return res.status(200).send({
            // success: false,
            code: "GT03"
          })
        }

        sql.query(`SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?`, [req.body.taskState, req.body.applicationName], async (err, result) => {
          if (err) {
            return res.status(200).send({
              // success: false,
              code: "GT03"
            })
          } else {
            return res.status(200).send({
              // success: false,
              code: "GT00",
              tasks: result
            })
          }
        })
      }
    })
  } catch (e) {
    res.status(200).send({
      code: "GT99"
    })
  }
}

exports.promoteTask2Done = async (req, res, result) => {
  try {
    console.log("==============================================================")
    console.log("Starting backend API: promoteTask2Done()")
    // Validate request
    if (!req.body || req.body == "" || req.body == null) {
      res.status(200).send({
        code: "PT99"
      })
    }
    // Login, no user/pw, wrong user/pw, return error code
    var login = await Login(req.body.username, req.body.password)
    if (login == false) {
      return res.status(200).send({
        // success: false,
        code: "PT01"
      })
    }

    if (typeof req.body.taskID !== "string" || req.body.taskID == "" || req.body.taskID == undefined || req.body.taskID == null || req.body.taskID.trim() == "" || req.body.taskID.trim() == null) {
      return res.status(200).send({
        // success: false,
        code: "PT02"
      })
    }

    var applicationName
    var tasknotes
    var taskstate
    sql.query(`SELECT * FROM task WHERE Task_id= ?`, req.body.taskID, async (err, result) => {
      if (err) {
        return res.status(200).send({
          // success: false,
          code: "PT02"
        })
      } else {
        try {
          applicationName = result[0].Task_app_Acronym
          tasknotes = result[0].Task_app_Acronym
          taskstate = result[0].Task_state
        } catch (error) {
          return res.status(200).send({
            // success: false,
            code: "PT02"
          })
        }
        // applicationName = result[0].Task_app_Acronym
        // tasknotes = result[0].Task_app_Acronym
        // taskstate = result[0].Task_state
        console.log("Application Name: ")
        console.log(applicationName)

        // get all permits from application
        var permitDoing = await GetPermits(applicationName)
        console.log("PERMIT DOING: ")
        console.log(permitDoing)
        if (permitDoing == false) {
          return res.status(200).send({
            // success: false,
            // something: "Hi",
            code: "PT02"
          })
        } else {
          console.log("PermitDoing: ")
          console.log(permitDoing[0].App_permit_Doing)
          permitDoing = permitDoing[0].App_permit_Doing
        }

        //checkgroup() to see if user belongs in permitcreate's group
        var inPermitDoing = await CheckGroup(req.body.username, permitDoing)
        if (inPermitDoing == true) {
          console.log("User in permit doing")
        } else {
          //user does not have permitdoing
          return res.status(200).send({
            code: "PT01"
          })

          // console.log("User not in permit doing")
        }

        var m = new Date()
        var dateString = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2)

        //notes
        var newTaskNote = req.body.taskNotes
        var taskNote
        if (newTaskNote != "" || newTaskNote != null) {
          console.log("New Note1 : " + newTaskNote)
          var newNote = "[" + req.body.username + "] added a new note: \n`" + newTaskNote + "`\nat State:" + taskstate + "\n [" + dateString + "]"
          console.log("New Note2 : " + newNote)
          taskNote = newNote + "\n\n" + tasknotes
        }

        if (taskstate != "doing") {
          return res.status(200).send({
            code: "PT02"
          })
        } else {
          sql.query(`UPDATE task SET Task_state = 'done', Task_notes=?, Task_owner=? WHERE Task_id = ?`, [taskNote, req.body.username, req.body.taskID], async (err, result) => {
            if (err) {
              return res.status(200).send({
                // success: false,
                code: "PT02"
              })
            } else {
              var emailList = await getEmail("pl")
              var msg = `Project lead, \n \n [TaskID]${req.body.taskID}, has been promoted from DOING to DONE state by [User]${req.body.username} \n\n\n\nSystem generated message, do not reply`
              for (i = 0; i < emailList.length; i++) {
                sendEmail(emailList[i], msg)
              }
              return res.status(200).send({
                // success: false,
                code: "PT00"
              })
            }
          })
        }
      }
    })
  } catch (e) {
    res.status(200).send({
      code: "PT99"
    })
  }
}
