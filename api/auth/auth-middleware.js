const { findBy } = require('./auth-model')

const checkUsernameExists = async (req, res, next) => {
    try {
        const [user] = await findBy({ username: req.body.username })
        if (user) {
            next({ status: 422, message: 'username taken' })
        } else {
            req.user = user
            next()
        }
    } catch (err) {
        next(err)
    }
}

const requestBodyCheck = (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        next({ status: 422, message: "username and password required" })
    } else {
        next()
    }
}

const validateCreds = async (req, res, next) => {
    const [user] = await findBy({ username: req.body.username })
    if (!user) {
        next({ status: 401, message: "invalid credentials" })
    } else {
        req.user = user
        next()
    }
}

module.exports = {
    checkUsernameExists,
    requestBodyCheck,
    validateCreds,
}