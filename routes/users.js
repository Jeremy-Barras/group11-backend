var express = require("express");
var validator = require("validator");
var router = express.Router();
var User = require("../model/User.js");
let { authorize, signAsynchronous } = require("../utils/auth");
const jwt = require("jsonwebtoken");
const jwtSecret = "jkjJ1235Ohno!";
const LIFETIME_JWT = 24 * 60 * 60 * 1000 ; // 10;// in seconds // 24 * 60 * 60 * 1000 = 24h 

/* GET user list : secure the route with JWT authorization */
router.get("/", function (req, res, next) {
    return res.json(User.list);
});

/* POST user data for authentication */
router.post("/login", function (req, res, next) {
  let user = new User(null, req.body.email, req.body.password);
  console.log("POST users/login:", User.list);
  user.checkCredentials(req.body.email, req.body.password).then((match) => {
    if (match) {
      jwt.sign({ email: user.email }, jwtSecret,{ expiresIn: LIFETIME_JWT }, (err, token) => {
        if (err) {
          console.error("POST users/ :", err);
          return res.status(500).send(err.message);
        }
        console.log("POST users/ token:", token);
        let userBestScoreEasy = user.getBestScore(user.email,"Easy");
        let userBestScoreMedium = user.getBestScore(user.email,"Medium");
        let userBestScoreHard = user.getBestScore(user.email,"Hard");
        return res.json({ email: user.email, token, bestScoreEasy: userBestScoreEasy, bestScoreMedium: userBestScoreMedium, bestScoreHard: userBestScoreHard });
      });
    } else {
      console.log("POST users/login Error:", "Unauthentified");
      return res.status(401).send("bad email/password");
    }
  })  
});

/* POST a new user */
router.post("/", function (req, res, next) {
  console.log("POST users/", User.list);
  console.log("email:", req.body.email);
  if(!validator.isStrongPassword(req.body.password)){
    return res.status(410).end();
  }
  if (User.isUser(req.body.email))
    return res.status(409).end();
  let newUser = new User(req.body.username, req.body.email, req.body.password);
  newUser.save().then(() => {
    console.log("afterRegisterOp:", User.list);
    jwt.sign({ username: newUser.username}, jwtSecret,{ expiresIn: LIFETIME_JWT }, (err, token) => {
      if (err) {
        console.error("POST users/ :", err);
        return res.status(500).send(err.message);
      }
      console.log("POST users/ token:", token);
      return res.json({ email: newUser.email, token, bestScoreEasy: newUser.bestScoreEasy, bestScoreMedium: newUser.bestScoreMedium, bestScoreHard: newUser.bestScoreHard });
    });
  });
});

/* GET user object from username */
router.get("/:username", function (req, res, next) {
  console.log("GET users/:username", req.params.username);
  const userFound = User.getUserFromList(req.params.username);
  if (userFound) {
    return res.json(userFound);
  } else {
    return res.status(404).send("ressource not found");
  }
});

/* PUT a update bestScore */
router.put("/:bestScore/:difficulty", function (req, res, next) {
  console.log("bestScore:", req.params.bestScore);
  console.log("difficulty:", req.params.difficulty);
  console.log("email:", req.body.email);
  if (!User.isUser(req.body.email)) return res.status(409).end();
  User.update(req.body.email,req.params.bestScore,req.params.difficulty);
});

module.exports = router;
