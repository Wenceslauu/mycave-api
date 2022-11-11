const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
    text: { type: String, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    date: { type: Date, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

module.exports = mongoose.model('Post', PostSchema)