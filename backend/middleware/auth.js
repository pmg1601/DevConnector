/* This Middle-ware is validating auth JWT token */

import jwt from 'jsonwebtoken'
import config from 'config'

/**
 * Middle-ware is something that runs between req and res cycle,
 * and next means that we should move to next middle-ware.
 */

export default (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token')

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No Token, authorization denied!' })
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwt_secret'))
        req.user = decoded.user // This is user_id in jwt token
        next()
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid!' })
    }
}
