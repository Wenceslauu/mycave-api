const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FriendRequestSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    addressee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], required: true }
})

module.exports = mongoose.model('Friend Request', FriendRequestSchema)