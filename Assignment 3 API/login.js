const db = require("./config/database")
const bcrypt = require("bcryptjs")

const Login = (username, password) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM user WHERE username = ? AND isactive = true `

    db.query(sql, [username], async (err, results) => {
      if (err) {
        reject(false)
      } else {
        try {
          if (results.length === 1) {
            const trueornot = await bcrypt.compare(password, results[0].password)
            // console.log("Password is: " + trueornot)
            if (trueornot == true) {
              resolve(true)
            } else {
              resolve(false)
            }
          } else {
            resolve(false)
          }
        } catch (e) {
          resolve(false)
        }
      }
    })
  })
}
module.exports = Login
