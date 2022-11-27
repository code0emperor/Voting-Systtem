var express = require("express");
var db = require("../database");
// var auth = require('auth');
var router = express.Router();
/* GET users listing. */
router.get("/dashboard", function (req, res, next) {
  // res.render('dashboard.ejs',{email:req.session.emailAddress})
  if (req.session.loggedinUser) {
    var phase;
    var sql = "SELECT * FROM phase";
    db.query(sql, (err, data, fields) => {
      console.log(sql);
      if (err) {
        console.log(err);
        throw err;
      }
      // console.log(data);
      phase = data[0].cur_phase;
      // console.log(data);
      // if (data[0].cur_phase == 0 || data[0].cur_phase == 2) {
      //   return res.render("dashboard.ejs", { phase: data[0].cur_phase });
      // }
    });
    // console.log(phase);
    var sql = "SELECT * FROM candidate";
    db.query(sql, (err, data, fields) => {
      if (err) {
        console.log(err);
        throw err;
      }
      // console.log(data);
      res.render("dashboard.ejs", {
        //   email: req.session.emailAddress,
        userData: data,
        phase: phase,
      });
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/dashboard", (req, res, next) => {
  const rollno = req.body.rollno;
  console.log(typeof req.body.rollno);
  console.log(rollno);
  var new_rollno = "";
  for (var i = 0; i < rollno.length; i++) {
    if (rollno[i] != "'") new_rollno += rollno[i];
  }
  console.log(new_rollno);
  new_rollno = parseInt(new_rollno);
  var sql = "UPDATE candidate SET votes = votes+1 WHERE rollno = ?";
  db.query(sql, [new_rollno], (err, data, fields) => {
    res.redirect("/result");
  });
});

router.get("/result", (req, res, next) => {
  var phase;
  var sql = "SELECT * FROM phase";
  db.query(sql, (err, data, fields) => {
    console.log(sql);
    if (err) {
      console.log(err);
      throw err;
    }
    // console.log(data);
    phase = data[0].cur_phase;
    // console.log(data);
    // if (data[0].cur_phase == 0 || data[0].cur_phase == 2) {
    //   return res.render("dashboard.ejs", { phase: data[0].cur_phase });
    // }
  });
  var sql = "SELECT * FROM candidate ORDER BY votes DESC, name";
  db.query(sql, (err, data, fields) => {
    res.render("result", { userData: data, phase: phase });
  });
});
module.exports = router;
