var express = require("express");
var router = express.Router();
/* GET users listing. */
// const express=require('express');
// const app=express()
var conn = require("../database");

router.get("/form", function (req, res, next) {
  // res.render('voter-registration.ejs');
  if (req.session.loggedinUser) {
    res.render("voter-registration.ejs");
  } else {
    res.redirect("/login");
  }
});

var getAge = require("get-age");

var nodemailer = require("nodemailer");
var rand = Math.floor(Math.random() * 10000 + 54);
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cyberden33@gmail.com",
    pass: "jafqlrpkrgkvujqn",
  },
});

var account_address;
var data;

// app.use(express.static('public'));
// //app.use('/css',express.static(__dirname+'public/css'));
// //app.use(express.json());
// app.use(express.urlencoded());

router.post("/registerdata", function (req, res) {
  var dob = [];
  data = req.body.roll; //data stores roll no
  console.log(req.body);
  account_address = req.body.account_address; //stores metamask acc address
  //console.log(data);
  let sql = "SELECT * FROM roll_info WHERE roll =?";
  conn.query(sql, data, (error, results, fields) => {
    if (error) {
      throw error;
    }
    if (results.length > 1) {
      var email = results[0].Email;
      is_registerd = results[0].Is_registered;
      if (is_registerd != "YES") {
        var mailOptions = {
          from: "sharayuingale19@gmail.com",
          to: email,
          subject: "Please confirm your Email account",
          text: "Hello, Your otp is " + rand,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        res.render("emailverify.ejs");
      } //IF USER ALREADY REGISTERED
      else {
        res.render("voter-registration.ejs", {
          alertMsg: "You are already registered. You cannot register again",
        });
      }
    } else {
      inputData = {
        roll: data,
        account_address: account_address,
        Email: req.body.email,
        Is_registered: "NO",
      };
      var sql = "INSERT INTO roll_info SET ?";
      conn.query(sql, inputData, function (err, data) {
        if (err) throw err;
      });
      // res.render("voter-registration.ejs", {
      //   alertMsg: "Email sent to verify",
      // });
      var mailOptions = {
        from: "sharayuingale19@gmail.com",
        to: req.body.email,
        subject: "Please confirm your Email account",
        text: "Hello, Your otp is " + rand,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.render("emailverify.ejs");
    }
  });
  //console.log(results)

  //console.log(dob);
  //console.log(age);
  //res.send("ok")
  //console.log(dob);
});

router.post("/otpverify", (req, res) => {
  var otp = req.body.otp;
  if (otp == rand) {
    var record = {
      roll: data,
      Account_address: account_address,
      Is_registered: "Yes",
    };
    var sql = "INSERT INTO registered_users SET ?";
    conn.query(sql, record, function (err2, res2) {
      if (err2) {
        throw err2;
      } else {
        var sql1 = "Update roll_info set Is_registered=? Where roll=?";
        var record1 = ["YES", data];
        console.log(data);
        conn.query(sql1, record1, function (err1, res1) {
          if (err1) {
            res.render("voter-registration.ejs");
          } else {
            console.log("1 record updated");
            var msg = "You are successfully registered";
            // res.send('You are successfully registered');
            res.render("voter-registration.ejs", { alertMsg: msg });
          }
        });
      }
    });
  } else {
    res.render("voter-registration.ejs", {
      alertMsg: "Session Expired! , You have entered wrong OTP ",
    });
  }
});

// router.get('/register',function(req,res){
//     res.sendFile(__dirname+'/views/index.html')
// });

/*app.get('/signin_signup',function(req,res){
    res.sendFile(__dirname+'/views/signup.html')
});

app.get('/signup',function(req,res){
    console.log(req.body);
    res.sendFile(__dirname+'/views/signup.html')
});*/

module.exports = router;
