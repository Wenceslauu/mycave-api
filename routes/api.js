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

router.get('/posts/stats', postController.countPosts)

router.put('/posts/:postID/toggle-like', postController.toggleLike)

router.get('/posts/:postID/comments', commentController.comments)

router.post('/posts/:postID/comments', commentController.writeComment)

router.delete('/posts/:postID/comments/:commentID', commentController.deleteComment)

router.get('/comments/stats', commentController.countComments)

router.get('/user', userController.ownUser)

router.put('/user', userController.editProfile)

router.get('/user/friend-requests', friendRequestController.friendRequests)

router.put('/user/friend-requests/:friendRequestID', friendRequestController.answerFriendRequest)

router.get('/users', userController.users)

router.get('/users/suggestions', userController.friendSuggestions)

router.get('/users/stats', userController.countUsers)

router.get('/users/:userID', userController.anyProfile)

router.post('/users/:userID/friend-requests', friendRequestController.sendFriendRequest)





module.exports = router