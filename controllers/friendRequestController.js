const passport = require('passport')
const async = require('async')

const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')

exports.friendRequests = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        FriendRequest.find({ addressee: req.user._id, status: 'Pending' }).populate('requester', ['username', 'photo']).exec((err, friendReq) => {
            if (err) return next(err)

            res.status(200).json({ friendRequests: friendReq })
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
            
                        res.status(200).json({ success: "Friend request sent" })
                    })
                }
            })
        }
    }
]

exports.answerFriendRequest = [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        if (req.body.answer !== 'Accepted' && req.body.answer !== 'Rejected')
            res.status(400).json({ error: 'Invalid friend request answer'})
        else {
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

                        res.status(200).json({ success: "Friend added" })
                    })
                } 

                else if (req.body.answer === 'Rejected')
                    res.status(200).json({ success: "Request rejected" })
            })
        }
    }
]