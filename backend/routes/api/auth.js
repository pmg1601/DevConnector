import express from 'express'
import config from 'config'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator'

import auth from '../../middleware/auth.js'
import User from '../../models/User.js'

const router = express.Router()

/** ---------------------------------------------------------------------------
 *
 * @route   GET api/auth
 * @desc    Test Route
 * @access  Public
 */
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error!')
    }
})

/** ---------------------------------------------------------------------------
 *
 * @route   POST api/auth
 * @desc    Authenticate User and get token
 * @access  Public
 */
router.post(
    '/',
    [
        check('email', 'Enter a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        // Validate data and log errors
        const errors = validationResult(req)

        // If there are errors send them back!
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
            /* -------------------------- See if user is valid --------------------------- */
            let user = await User.findOne({ email })

            if (!user) {
                console.log('- Invalid Credentials!'.red)
                return res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials!' }]
                })
            } else {
                console.log('- User Exists!'.green)
            }

            /* ------------------------- Validate user password ------------------------- */
            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                console.log('- Invalid Credentials!'.red)
                return res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials!' }]
                })
            }

            /* --------------------------- Return JsonWebToken -------------------------- */
            const payload = { user: { id: user.id } }

            jwt.sign(
                payload,
                config.get('jwt_secret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err
                    console.log('- JWT Token Created and sent!'.green)
                    res.status(201).json({ token })
                }
            )
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Server Error')
        }
    }
)
export default router
