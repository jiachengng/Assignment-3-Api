const db = require("./config/database")
const nodemailer = require("nodemailer")

exports.sendEmail = (recipientEmail, msg) => {
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e54afaeb77100c",
      pass: "9f53fef0a366c5"
    }
  })

  transport.sendMail({
    from: '"Ghosty Admin 👻" <ghosty@admin.com>',
    to: `${recipientEmail}`,
    subject: "A task is promoted to done",
    text: `${msg}`,
    html: "<b>Hello world?</b>"
  })
}

// Retrieve task without plan
exports.getEmail = group_name => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT u.email FROM user u INNER JOIN usergroup ug ON u.username = ug.username WHERE ug.groupname = "${group_name}"`

    db.query(sql, (err, results) => {
      if (err) {
        console.log(err)
        reject(false)
      } else {
        var emaillist = []
        for (var i = 0; i < results.length; i++) {
          emaillist.push(results[i].email)
        }
        resolve(emaillist)
      }
    })
  })
}
