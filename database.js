var mysql = require("mysql");
var conn = mysql.createConnection({
  host: "localhost", // assign your host name
  user: "root", //  assign your database username
  password: "Reshmichetna1234!!", // assign your database password
  database: "voting", // assign database Name
});
conn.connect((err) => {
  if (err) throw err;
  console.log("Database is connected successfully !");
});
module.exports = conn;
