const mysql = require("mysql2")

var connection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  timezone: "Z"
})

// open the MySQL connection
connection.getConnection(error => {
  console.log(connection)
  if (error) throw error
  console.log("Successfully connected to database.")
})
module.exports = connection

//--------------------------------
