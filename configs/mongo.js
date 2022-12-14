const mongoose = require('mongoose')
require('dotenv').config()

const mongoDB = process.env.DB_URL_STRING

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: false })
const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))