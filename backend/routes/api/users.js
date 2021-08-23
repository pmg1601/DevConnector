import express from 'express'
import { check, validationResult } from 'express-validator'
import gravatar from 'gravatar'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import colors from 'colors'

import User from '../../models/User.js'

/* -------------------------------------------------------------------------- */

const router = express.Router()

/**
 * @route   POST api/users
 * @desc    Register User
 * @access  Public
 */
router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Enter a valid email').isEmail(),
        check(
            'password',
            'Please Enter a password with 6 or more characters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        // Validate data and log errors
        const errors = validationResult(req)

        // If there are errors send them back!
        if (!errors.isEmpty()) {
            console.error('- Some fields are required!'.red)
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password } = req.body

        try {
            /* --------------------------- See if user exists --------------------------- */
            let user = await User.findOne({ email })

            if (user) {
                console.log('- User Already Exists'.yellow)
                return res.status(400).json({
                    errors: [{ msg: 'User Already Exists!' }]
                })
            } else {
                console.log('- User Does Not Exist!'.yellow)
            }

            /* --------------------------- Get users gravatar --------------------------- */
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password
            })

            /* ---------------------------- Encrypt password ---------------------------- */
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)

            await user.save()
            console.log('- User Created!'.green)

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

            console.log('- User registered!'.green)
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Server Error')
        }
    }
)

export default router
