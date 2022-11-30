const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const friendRequestController = require('../controllers/friendRequestController')
const postController = require('../controllers/postController')
const commentController = require('../controllers/commentController')

router.post('/signup', userController.signup)

router.post('/login', userController.login)

router.get('/posts', postController.posts)

router.post('/posts', postController.writePost)

router.delete('/posts/:postID', postController.deletePost)

router.put('/posts/:postID/toggle-like', postController.toggleLike)

router.get('/posts/:postID/comments', commentController.comments)

router.post('/posts/:postID/comments', commentController.writeComment)

router.delete('/posts/:postID/comments/:commentID', commentController.deleteComment)

router.get('/user', userController.ownProfile)

router.post('/user/photo', userController.editPhoto)

router.get('/users', userController.users)

router.get('/users/:userID', userController.anyProfile)

router.get('/users/:userID/friends', userController.friends)

router.get('/user/friend-requests', friendRequestController.friendRequests)

router.post('/users/:userID/friend-requests', friendRequestController.sendFriendRequest)

router.put('/user/friend-requests/:friendRequestID', friendRequestController.answerFriendRequest)


module.exports = router