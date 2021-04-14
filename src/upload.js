const express = require("express");
const router = express.Router();
const { authCheck } = require("./authMiddleware");
const multer = require("multer");
const hash = require("random-hash");
const jwt = require("jsonwebtoken");
const { query, updatePush } = require("../db/query");
const nodemailer = require("nodemailer");
var mail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rohan007008009@gmail.com",
    pass: "ueilijdzcpdhkoom",
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    let temp = file.originalname.split(".");
    const filename =
      temp[0] + "_" + hash.generateHash({ length: 5 }) + "." + temp[1];
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

router.get("/upload", authCheck, (req, res) => {
  let token = req.cookies.jwt;
  let obj = jwt.verify(token, process.env.JWT_SECRET);
  let q = { _id: obj._id };
  query(q).then((user) => {
    res.render("upload", { name: user[0].name });
  });
});

router.post("/upload", authCheck, upload.array("audio", 12), (req, res) => {
  let token = req.cookies.jwt;
  let obj = jwt.verify(token, process.env.JWT_SECRET);
  let all = req.files;
  let q = { _id: obj._id };
  let dbin = [];
  all.forEach((ele) => {
    let obj1 = {};
    obj1.path = ele.path;
    obj1.exp = Math.random() * (300000 - 60000) + 60000;
    dbin.push(obj1);
  });

  let pushEle = { root: dbin };
  updatePush(q, pushEle).then(async (result) => {
    let to1 = await query(q);
    let to2 = to1[0].email;
    //console.log(to2);
    if (result) {
      console.log(result);
      res.send("uploaded");
      dbin.forEach((ans) => {
        let mailOptions = {
          from: "rohan007008009@gmail.com",
          to: to2,
          subject: "Sending Email using Node.js",
          html: "<h1>Welcome</h1><p>That was easy!</p>",
          attachments: [
            {
              path: ans.path,
            },
          ],
        };

        setTimeout(function () {
          mail.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }, ans.exp);
      });
    }
  });
});
module.exports = router;
