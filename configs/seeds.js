const { faker } = require('@faker-js/faker')

const User = require('../models/User')
const Post = require('../models/Post')
const Comment = require('../models/Comment')

// database setup
require('./mongo')

const users = []
const posts = []
const comments = []

function createRandomUser() {
    const genders = ['male', 'female']
    const random = Math.floor(Math.random() * genders.length)
    const randomGender = genders[random]

    const first_name = faker.name.firstName(randomGender)
    const last_name = faker.name.lastName(randomGender)

    const user = new User({
        first_name,
        last_name,
        username: faker.internet.userName(first_name, last_name),
        password: faker.internet.password(),
        age: faker.datatype.number({ min: 12, max: 50 }),
        bio: faker.lorem.paragraph(),
        isBot: true,
        friends: []
    })

    users.push(user)
}

function createRandomPost(userID) {
    const post = new Post({
        text: faker.lorem.paragraph(),
        user: userID,
        date: faker.date.soon(),
        likes: []
    })

    posts.push(post)
}

function createRandomComment(userID, postID) {
    const comment = new Comment({
        text: faker.lorem.paragraph(),
        user: userID,
        post: postID,
        date: faker.date.soon()
    })

    comments.push(comment)
}

function addPosts() {
    users.forEach((user) => {
        for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
            createRandomPost(user._id)
        }
    })
}

function addComments() {
    posts.forEach((post) => {
        users.forEach((user) => {
            if (Math.random() > 0.8)
                createRandomComment(user._id, post._id)
        })
    })
}

function addLikes() {
    posts.forEach((post) => {
        users.forEach((user) => {
            if (Math.random() > 0.6)
                post.likes.push(user._id)
        })
    })
}

function addFriends() {
    users.forEach((firstUser) => {
        users.forEach((secondUser) => {
            if ((!firstUser._id.equals(secondUser._id)) && (!firstUser.friends.includes(secondUser._id))) {
                if (Math.random() > 0.75) {
                    firstUser.friends.push(secondUser._id)
                    secondUser.friends.push(firstUser._id)
                }
            }
        })
    })
}

function seed() {
    for (let i = 0; i < 30; i++) {
        createRandomUser()
    }

    addPosts()
    addComments()
    addLikes()
    addFriends()

    users.forEach(async (user) => {
        try {
            await user.save()
        } catch (err) {
            console.log(err)
        }
    })

    posts.forEach(async (post) => {
        try {
            await post.save()
        } catch (err) {
            console.log(err)
        }
    })

    comments.forEach(async (comment) => {
        try {
            await comment.save()
        } catch (err) {
            console.log(err)
        }
    })
}

seed()