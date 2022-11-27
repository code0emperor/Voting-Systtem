var express = require("express");
var router = express.Router();
var db = require("../database");
var app = express();
app.use(express.urlencoded());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));

// to display registration form
router.get("/register", function (req, res, next) {
  res.render("registration-form.ejs");
});

// to store user input detail on post request
router.post("/register", function (req, res, next) {
  inputData = {
    first_name: req.body.first_name,
    roll: req.body.roll,
    email_address: req.body.email_address,
    password: req.body.password,
    confirm_password: req.body.confirm_password,
    isAdmin: 0,
  };

  // check unique email address

  var sql = "SELECT * FROM registration WHERE email_address =?";
  db.query(sql, [inputData.email_address], function (err, data, fields) {
    if (err) throw err;
    if (data.length > 1) {
      var msg = inputData.email_address + " already exist";
    } else if (inputData.confirm_password != inputData.password) {
      var msg = "Password & Confirm Password is not Matched";
    } else {
      // save users data into database
      var sql = "INSERT INTO registration SET ?";
      console.log(sql);
      db.query(sql, inputData, function (err, data) {
        if (err) throw err;
      });
      var msg = "Your are successfully registered";
    }
    res.render("registration-form.ejs", { alertMsg: msg });
  });
});

router.post("/addCandidate", function (req, res, next) {
  inputData = {
    name: req.body.name,
    rollno: req.body.rollno,
    branch: req.body.branch,
    section: req.body.section,
    year: req.body.year,
    votes: 0,
  };

  // check unique roll number

  var sql = "SELECT * FROM candidate WHERE rollno =?";
  db.query(sql, [inputData.rollno], function (err, data, fields) {
    if (err) throw err;
    if (data.length >= 1) {
      var msg = inputData.rollno + " already exists";
    } else {
      // save users data into database
      var sql = "INSERT INTO candidate SET ?";
      console.log(sql);
      db.query(sql, inputData, function (err, data) {
        if (err) throw err;
      });
      var msg = "Your are successfully registered";
    }
    res.render("adminAddCandidate.ejs", { alertMsg: msg });
  });
});

router.post("/changePhase", (req, res, next) => {
  var sql = "SELECT cur_phase FROM phase";
  db.query(sql, (err, data, fields) => {
    if (err) {
      console.log(err);
      throw err;
    }
    var phase = data[0].cur_phase;
    const cur_phase = phase;
    if (phase == 2) phase = 0;
    else phase++;
    console.log(sql);
    sql = "UPDATE phase SET cur_phase = ? WHERE cur_phase = ?";
    db.query(sql, [phase, cur_phase], (err, data, fields) => {
      if (err) {
        console.log(err);
        throw err;
      }
    });
    var msg;
    if (phase == 0) msg = "Current Phase : Registration";
    else if (phase == 1) msg = "Current Phase : Voting";
    else msg = "Current Phase : Result";

    res.render("adminChangePhase.ejs", { alertMsg: msg });
  });
});
module.exports = router;
