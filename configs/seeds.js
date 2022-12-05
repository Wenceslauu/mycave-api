const { faker } = require('@faker-js/faker')

const User = require('../models/User')
const Post = requrie('../models/Post')
const Comment = require('../models/Comment')

const user = new User({
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
    age: faker.datatype.number(50)
})

// const post = new Post({
//     text: faker.lorem.lines(),
//     user: ,
//     date: faker.date.soon(),
//     likes: []
// })

// const comment = new Comment({
//     text: faker.lorem.lines(),
//     user: ,
//     post: ,
//     date: faker.date.soon()
// })