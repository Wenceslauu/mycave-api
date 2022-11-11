const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, minLength: 8, required: true },
    age: { type: Number, min: 12, required: true },
    photo: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User'}]
})

UserSchema.virtual('full_name').get(function() {
    return `${this.first_name} ${this.last_name}`
})

module.exports = mongoose.model('User', UserSchema)