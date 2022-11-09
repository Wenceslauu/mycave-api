const { body, validationResult } = require('express-validator')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const issueJWT = require('../utils/issueJWT')

exports.signup = [
    body('first_name', 'First name required.').trim().notEmpty().escape(),
    body('last_name', 'Last name required.').trim().notEmpty().escape(),
    body('age').exists({ checkNull: true }).withMessage('Age required').isInt({ min: 12 }).withMessage('You must be at least 12 years old to sign-up.').toInt(),
    body('username', 'Username required.').trim().notEmpty().escape(),
    body('password').trim().notEmpty().withMessage('Password required.').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.').escape(),
    body('confirm_password', 'Passwords must match.').custom((value, { req }) => {
        return value === req.body.password
    }),
    (req, res, next) => {
        const errors = validationResult(req)

        const userRetry = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            age: req.body.age,
            username: req.body.username,
        })

        if (!errors.isEmpty()) 
            res.json({ user: userRetry, errors: errors.array() })
        else {
            bcrypt.hash(req.body.password, 10, (err, hashed_password) => {
                if (err) return next(err)

                const user = new User({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    age: req.body.age,
                    username: req.body.username,
                    password: hashed_password
                })

                user.save((err, user) => {
                    if (err) return next(err)

                    res.status(200).end()
                })

                // find out how redirect would work here
            })
        }
    }
]

exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user) => {
        if (err) return next(err)

        const { token, expiresIn } = issueJWT(user)
        res.json({ token, expiresIn })
    })(req, res)
}