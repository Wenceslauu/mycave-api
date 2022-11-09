const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const friendRequestController = require('../controllers/friendRequestController')

router.post('/signup', userController.signup)

router.post('/login', userController.login)

router.get('/users/:userID/', userController.profile)

router.get('/users/:userID/friend-requests', friendRequestController.friendRequests)

router.post('/users/:userID/friend-requests', friendRequestController.sendFriendRequest)

router.put('/users/:userID/friend-requests/:friendRequestID', friendRequestController.answerFriendRequest)


module.exports = router