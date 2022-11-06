const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    photo: { data: Buffer, contentType: String },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    friend_requests: [{ type: Schema.Types.ObjectId, ref: 'User'}]
})

UserSchema.virtual('url').get(function() {
    return `/api/users/${this._id}`
})

module.exports = mongoose.model('User', UserSchema)