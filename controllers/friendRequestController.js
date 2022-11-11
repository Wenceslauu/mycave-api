const passport = require('passport')
const async = require('async')
const checkProfileOwner = require('../middleware/checkProfileOwner')

const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')

exports.friendRequests = [
    passport.authenticate('jwt', { session: false }),
    checkProfileOwner,
    (req, res, next) => {
        FriendRequest.find({ addressee: req.params.userID, status: 'Pending' }).populate('requester', ['username', 'photo']).exec((err, friendReq) => {
            if (err) return next(err)

            res.status(400).json({ friendRequests: friendReq, number_of_requests: friendReq.length })
        })
    }
]

exports.sendFriendRequest = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        if (req.user._id.equals(req.params.userID)) 
            res.status(400).json({ error: "You can't send a friend request to yourself." })

        else if (req.user.friends.includes(req.params.userID)) 
            res.status(400).json({ error: 'This user is already on your friends list.'})

        else {
            // searches for any pending requests between both users
            FriendRequest.findOne({ status: 'Pending', $or: [{ requester: req.user._id, addressee: req.params.userID }, { requester: req.params.userID, addressee: req.user._id }]}, (err, friendReq) => {
                if (err) return next(err)

                if (friendReq) {
                    res.status(400)
                    
                    if (friendReq.requester.equals(req.user._id))
                        res.json({ error: "You've already sent this user a pending friend request." })

                    else if (friendReq.requester.equals(req.params.userID))
                        res.json({ error: "This user has already sent you a pending friend request." })
                }

                else {
                    const friendReq = new FriendRequest({
                        requester: req.user._id,
                        addressee: req.params.userID,
                        status: 'Pending'
                    })

                    friendReq.save((err) => {
                        if (err) return next(err)
            
                        res.status(200).end()
                    })
                }
            })
        }
    }
]

exports.answerFriendRequest = [
    passport.authenticate('jwt', { session: false }),
    checkProfileOwner,
    (req, res, next) => {
        FriendRequest.findByIdAndUpdate(req.params.friendRequestID, { status: req.body.answer }, (err, friendReq) => {
            if (err) return next(err)

            // adds both users as friends to each other
            if (req.body.answer === 'Accepted') {
                async.parallel({
                    requester(cb) {
                        User.findByIdAndUpdate(friendReq.requester, { $push: { friends: friendReq.addressee }}).exec(cb)
                    },
                    addressee(cb) {
                        User.findByIdAndUpdate(friendReq.addressee, { $push: { friends: friendReq.requester }}).exec(cb)
                    }
                }, (err) => {
                    if (err) return next(err)

                    res.json(200).end()
                })
            } 

            else if (req.body.answer === 'Rejected')
                res.json(200).end()

            else 
                return next(new Error('Invalid friend request answer.'))
        })
    }
]