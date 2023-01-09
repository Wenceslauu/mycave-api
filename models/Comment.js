const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
    text: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }
})

CommentSchema.index({ post: 1 })

module.exports = mongoose.model('Comment', CommentSchema)