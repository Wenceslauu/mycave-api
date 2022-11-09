const jwt = require('jsonwebtoken')
require('dotenv').config()

function issueJWT(user) {
    const _id = user._id
    const expiresIn = '1d'
    const algorithm = 'HS256'

    const payload = {
        sub: _id,
        iat: Date.now()
    }

    const signedToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn, algorithm })

    return {
        token: 'Bearer ' + signedToken,
        expiresIn
    }
}

module.exports = issueJWT

