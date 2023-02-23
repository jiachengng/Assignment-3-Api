const db = require("./config/database")

const GetAppRnumber = applicationName => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT App_Rnumber FROM application WHERE App_Acronym = ?`

    db.query(sql, [applicationName], (err, results) => {
      if (err) {
        reject(false)
      } else {
        try {
          if (results.length === 1) {
            resolve(results)
          } else {
            resolve("no such appName")
          }
        } catch (e) {
          resolve(false)
        }
      }
    })
  })
}
module.exports = GetAppRnumber
