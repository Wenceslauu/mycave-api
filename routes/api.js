const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')

router.post('/signup', userController.signup)

router.post('/login', userController.login)

const passport = require('passport')

router.get('/auth-test', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({ msg: "Congratulations! You've been authenticated" })
})

module.exports = router