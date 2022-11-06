const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { DateTime } = require('luxon')

const PostSchema = new Schema({
    text: { type: String, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    date: { type: Date, required: true }
})

PostSchema.virtual('formatted-date').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_MED)
})

PostSchema.virtual('url').get(function() {
    return `/api/posts/${this._id}`
})

module.exports = mongoose.model('Post', PostSchema)