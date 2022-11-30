const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/User')
require('dotenv').config()

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    algorithms: ['HS256']
}

exports.jwtStrat = (passport) => {
    passport.use(new JwtStrategy(options, function(jwt_payload, cb) {
        User.findById(jwt_payload.sub, function(err, user) {
            if (err) return cb(err, false)

            if (user) return cb(null, user)

            else return cb(null, false)
        })
    }))
}