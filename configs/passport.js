const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const bcrypt = require('bcryptjs')
const User = require('../models/User')
require('dotenv').config()

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    algorithms: ['HS256']
}

exports.localStrat = (passport) => {
    passport.use(new LocalStrategy((username, password, cb) => {
        User.findOne({ username }, (err, user) => {
            if (err) return cb(err)

            if (!user) return cb(null, false, { message: "Incorrect username" })

            bcrypt.compare(password, user.password, (err, res) => {
                if (err) return cb(err)

                if (res) return cb(null, user)
                
                else return cb(null, false, { message: "Incorrect password" })
            })
        })
    }))
}

exports.jwtStrat = (passport) => {
    passport.use(new JwtStrategy(options, function(jwt_payload, cb) {
        User.findById(jwt_payload.sub, function(err, user) {
            if (err) return cb(err)

            if (user) return cb(null, user)

            else return cb(null, false)
        })
    }))
}