const { body, validationResult } = require('express-validator')
const async = require('async')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const cloudinary = require('cloudinary')
const { unlinkSync } = require('fs')
const issueJWT = require('../utils/issueJWT')
const upload = require('../configs/multer')

const User = require('../models/User')
const Post = require('../models/Post')

exports.signup = [
    body('first_name', 'First name required.').trim().notEmpty().escape(),
    body('last_name', 'Last name required.').trim().notEmpty().escape(),
    body('age').exists({ checkFalsy: true }).withMessage('Age required').isInt({ min: 12 }).withMessage('You must be at least 12 years old to sign-up.').toInt(),
    body('username', 'Username required.').trim().notEmpty().escape(),
    body('password').trim().notEmpty().withMessage('Password required.').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.').escape(),
    body('confirm_password', 'Passwords must match.').custom((value, { req }) => {
        return value === req.body.password
    }),
    (req, res, next) => {
        const errors = validationResult(req)

        const errorMsgs = errors.array().map((error) => {
            return error.msg
        })

        const userRetry = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            age: req.body.age,
            username: req.body.username,
        })

        if (!errors.isEmpty()) 
            res.status(400).json({ user: userRetry, errors: errorMsgs })
        else {
            bcrypt.hash(req.body.password, 10, (err, hashed_password) => {
                if (err) return next(err)

                // capitalizes compound names
                const firstNames = req.body.first_name.toLowerCase().split(' ')
                const lastNames = req.body.last_name.toLowerCase().split(' ')
        
                for (let i = 0; i < firstNames.length; i++) {
                  firstNames[i] = firstNames[i].charAt(0).toUpperCase() + firstNames[i].substring(1)
                }
        
                for (let i = 0; i < lastNames.length; i++) {
                  lastNames[i] = lastNames[i].charAt(0).toUpperCase() + lastNames[i].substring(1)
                }
        
                const capitalizedFirstName = firstNames.join(' ')
                const capitalizedLastName = lastNames.join(' ')

                const user = new User({
                    first_name: capitalizedFirstName,
                    last_name: capitalizedLastName,
                    age: req.body.age,
                    username: req.body.username,
                    password: hashed_password,
                })

                user.save((err) => {
                    if (err) return next(err)

                    res.status(200).json({ success: "Signup successful"})
                })
            })
        }
    }
]

exports.login = (req, res, next) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) return next(err)
        
        if (!user) {
            res.status(400).json({ error: "Incorrect username" })
        } else {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) return next(err)
                
                if (result) {
                    const { token, expiresIn } = issueJWT(user)
                    res.status(200).json({ token, expiresIn, success: "Login successful" })
                } else {
                    res.status(400).json({ error: "Incorrect password" })
                }
            })
        }
    })
}

exports.ownUser = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        User.findById(req.user._id, ['_id', 'username', 'photo', 'friends'], (err, user) => {
            if (err) return next(err)

            res.status(200).json({ user })
        })
    }
]

exports.users = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        User.find({}, ['username', 'photo']).exec((err, users) => {
            if (err) return next(err)

            res.status(200).json({ users })
        })
    }
]

exports.friendSuggestions = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        User.find({ $nor: [{ _id: { $in: req.user.friends }}, { _id: req.user._id }]}, ['username', 'photo']).limit(3).exec((err, users) => {
            if (err) return next(err)

            res.status(200).json({ users })
        })
    }
]

exports.anyProfile = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        async.parallel({
            user(cb) {
                User.findById(req.params.userID).populate('friends', ['username', 'photo']).exec(cb)
            },
            posts(cb) {
                Post.find({ user: req.params.userID }).populate('user', ['username', 'photo']).sort({ date: 'desc' }).exec(cb)
            }
        }, (err, results) => {
            if (err) return next(err)

            res.status(200).json({
                user: {
                    username: results.user.username,
                    name: results.user.full_name,
                    photo: results.user.photo,
                    age: results.user.age,
                    bio: results.user.bio,
                    isBot: results.user.isBot
                },
                friends: results.user.friends,
                posts: results.posts,
            })
        })
    }
]

exports.editProfile = [
    passport.authenticate('jwt', { session: false }),
    upload.single('photo'),
    (req, res, next) => {
        if (!req.file) {            
            User.findByIdAndUpdate(req.user._id, { bio: req.body.bio }, (err) => {
                if (err) return next(err)
    
                res.status(200).json({ success: "Profile edited" })
            })
        } else {
            cloudinary.v2.uploader.upload(req.file.path, {
                width: 512,
                height: 512,
                crop: 'fill',
                gravity: 'faces'
            }, (err, result) => {
                if (err) return next(err)

                User.findByIdAndUpdate(req.user._id, { photo: result.url, bio: req.body.bio }, (err) => {
                    if (err) return next(err)
        
                    unlinkSync(req.file.path)

                    res.status(200).json({ url: result.url, success: "Profile edited" })
                })
            })
        }
    }
]

exports.countUsers = (req, res, next) => {
    User.countDocuments().exec((err, count) => {
        if (err) return next(err)

        res.status(200).json({ count })
    })
}
