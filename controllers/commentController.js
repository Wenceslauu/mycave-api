const { body, validationResult } = require("express-validator")
const passport = require('passport')

const Comment = require('../models/Comment')

exports.comments = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        Comment.find({ post: req.params.postID }).populate('user', ['username', 'photo']).sort({ date: 'desc' }).exec((err, comments) => {
            if (err) return next(err)

            res.status(200).json({ comments, commentsNumber: comments.length })
        })
    }
]

exports.writeComment = [
    passport.authenticate('jwt', { session: false }),
    body('text', 'Text required.').trim().notEmpty().escape(),
    (req, res, next) => {
        const errors = validationResult(req)

        const errorMsgs = errors.array().map((error) => {
            return error.msg
        })

        if (!errors.isEmpty()) 
            res.status(400).json({ errors: errorMsgs })
        else {
            const comment = new Comment({
                text: req.body.text,
                post: req.params.postID,
                user: req.user._id,
                date: Date.now()
            })

            comment.save((err) => {
                if (err) return next(err)

                res.status(200).end()
            })
        }
    }
]

exports.deleteComment = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        Comment.findById(req.params.commentID, 'user', (err, results) => {
            if (err) return next(err)

            if (!req.user._id.equals(results.user))
                res.status(401).end()

            else {
                Comment.findByIdAndDelete(req.params.commentID, (err) => {
                    if (err) return next(err)

                    res.status(200).end()
                })
            }
        })
    }
]