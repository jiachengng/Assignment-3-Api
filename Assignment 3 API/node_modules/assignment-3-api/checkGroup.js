const db = require("./config/database")

const CheckGroup = (username, groupname) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM usergroup WHERE username = '${username}' AND groupname = '${groupname}'`

    db.query(sql, (err, results) => {
      if (err) {
        reject(false)
      } else {
        try {
          if (results[0].isActive === 1) {
            resolve(true)
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

module.exports = CheckGroup
