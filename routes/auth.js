const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const User = require('../models/UserFileUploader');
const router = express.Router()

router.post("/registerNewAccount", async (req, res) => {
    const { fullname, username, password, confirmPassword } = req.body;

    const isMatch = password === confirmPassword;
    const existingUser = await User.findOne({ username });

    if (!isMatch || existingUser) {
        return res.redirect("/register");
    }

    try {
        const hashedPassword = await new Promise((resolve, reject) => {
            crypto.pbkdf2(password, 'staticSalt', 310000, 32, 'sha256', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });

        const data = new User({
            fullname: fullname,
            username: username,
            password: hashedPassword,
            files: []
        });

        await User.saveUser(data);

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering user");
    }
});

passport.use(new LocalStrategy(async function verify(username, password, done) {
    try {
        const existingUser = await User.findOne({ username });

        if (!existingUser) {
            return done(null, false, { message: "Incorrect username or password!" });
        }

        const hashedPassword = await new Promise((resolve, reject) => {
            crypto.pbkdf2(password, 'staticSalt', 310000, 32, 'sha256', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });

        if (existingUser.password !== hashedPassword) {
            return done(null, false, { message: "Incorrect username or password!" });
        }

        return done(null, existingUser);
    } catch (err) {
        return done(err);
    }
}));


passport.use(new LocalStrategy(async function verify(username, password, done) {
    try {
      const existingUser = await User.findOne({ username });
  
      if (!existingUser) {
        return done(null, false, { message: "Incorrect username or password!" });
      }
  
      const hashedPassword = await new Promise((resolve, reject) => {
        crypto.pbkdf2(password, 'staticSalt', 310000, 32, 'sha256', (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey.toString('hex'));
        });
      });
  
      if (existingUser.password !== hashedPassword) {
        return done(null, false, { message: "Incorrect username or password!" });
      }
  
      return done(null, existingUser);
    } catch (err) {
      return done(err);
    }
}));

router.get("/register", (req, res) => {
    let login = req.session.login
    if(login){
        res.redirect("/")
    }
    else{
        res.render("register", {login:login})
    }
})

router.get("/login", async (req, res) => {
    let login = req.session.login
    if(login){
        res.redirect("/")
    }
    else{
        res.render("login", {login:login})
    }
})

router.post("/LoginToAccount", async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err){
            return next(err)
        }
        if(!user){
            return res.redirect("/login")
        }

        req.session.user = {
            id: user._id,
            fullname: user.fullname,
            username: user.username,
        }
        req.session.login = true
        req.session.cookie.maxAge = 3600000
        console.log(`${req.session.user.username} has logged in!`)
        res.redirect("/")
    })(req, res, next)
})

module.exports = router