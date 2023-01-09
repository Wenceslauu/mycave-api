const { body, validationResult } = require('express-validator')
const passport = require('passport')
const async = require('async')

const Post = require('../models/Post')
const Comment = require('../models/Comment')

exports.posts = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        Post.find({ $or: [{ user: { $in: req.user.friends }}, { user: req.user._id }]}).populate('user', ['username', 'photo']).sort({ date: 'desc', _id: 'desc' }).skip(parseInt(req.query.page * 5) + parseInt(req.query.offset)).limit(5).exec((err, posts) => {
            if (err) return next(err)

            res.status(200).json({ posts })
        })
    }
]

exports.writePost = [
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
            const post = new Post({
                text: req.body.text,
                user: req.user._id,
                date: Date.now()
            })

            post.save((err) => {
                if (err) return next(err)

                res.status(200).json({ postID: post._id, postDate: post.date, success: "Post wrote" })
            })
        }
    }
]

exports.deletePost = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        Post.findById(req.params.postID, 'user', (err, result) => {
            if (err) return next(err)

            if (!req.user._id.equals(result.user))
                res.status(401).end()
            else {
                async.parallel({
                    del_post(cb) {
                        Post.findByIdAndDelete(req.params.postID).exec(cb)
                    },
                    del_comments(cb) {
                        Comment.deleteMany({ post: req.params.postID }).exec(cb)
                    }
                }, (err) => {
                    if (err) return next(err)
            
                    res.status(200).json({ success: "Post deleted"})
                })
            }
        })
    }
]

exports.toggleLike = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        Post.findById(req.params.postID, (err, post) => {
            if (err) return next(err)

            const likeIndex = post.likes.findIndex((like) => {
                return like.equals(req.user._id)
            })

            if (likeIndex === -1) 
                post.likes.push(req.user._id)
            else
                post.likes.splice(likeIndex, 1) 
            
            post.save((err) => {
                if(err) return next(err)

                res.status(200).end()
            })
        })
    }
]

exports.countPosts = (req, res, next) => {
    Post.countDocuments().exec((err, count) => {
        if (err) return next(err)

        res.status(200).json({ count })
    })
}