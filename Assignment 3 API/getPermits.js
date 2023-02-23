const db = require("./config/database")

const GetPermits = applicationName => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT App_permit_Open,App_permit_toDoList,App_permit_Doing,App_permit_Done,App_permit_Create FROM application WHERE App_Acronym = '${applicationName}'`

    db.query(sql, (err, results) => {
      if (err) {
        reject(false)
        // console.log("1")
      } else {
        try {
          // if (results[0].length >= 1) {
          resolve(results)
          // console.log("22")
          // } else {
          //   resolve(false)
          // }
        } catch (e) {
          resolve(false)
          // console.log("3")
        }
      }
    })
  })
}
module.exports = GetPermits
