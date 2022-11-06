const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { DateTime } = require('luxon')

const CommentSchema = new Schema({
    text: { type: String, required: true},
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    date: { type: Date, required: true }
})

CommentSchema.virtual('formatted-date').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_MED)
})

CommentSchema.virtual('url').get(function() {
    return `/api/posts/${this.post}/comments/${this._id}`
})

module.exports = mongoose.model('Comment', CommentSchema)