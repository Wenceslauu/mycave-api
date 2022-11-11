function checkProfileOwner(req, res, next) {
    if (!req.user._id.equals(req.params.userID))
        res.status(401).end()
    else
        next()
}

module.exports = checkProfileOwner