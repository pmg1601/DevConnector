import express from 'express'
import { check, validationResult } from 'express-validator'
import request from 'request'
import config from 'config'

import auth from '../../middleware/auth.js'
import Profile from '../../models/Profile.js'
import User from '../../models/User.js'
import Post from '../../models/Post.js'
/* -------------------------------------------------------------------------- */

const router = express.Router()

/** ---------------------- Get profile for current user ----------------------
 * @route   GET api/profile/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        )

        if (!profile) {
            return res
                .status(400)
                .json({ msg: 'There is no profile for this user.' })
        }

        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

/** ------------------------- Create / update profile ------------------------
 * @route   POST api/profile
 * @desc    Create / update a user profile
 * @access  Private
 */

router.post(
    '/',
    [
        auth,
        [check('status', 'Status is required').not().isEmpty()],
        check('skills', 'Skills are required').not().isEmpty()
    ],

    async (req, res) => {
        const errors = validationResult(req)

        // There are some errors (required Fields)
        if (!errors.isEmpty()) {
            console.log('- Status and skills are required!'.red)
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body

        // Built profile object
        const profileFields = {}
        profileFields.user = req.user.id

        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername

        // Make array of skills
        if (skills) {
            profileFields.skills = skills
                .split(',')
                .map((skill) => skill.trim())
        }

        // Build social object
        profileFields.social = {}

        if (youtube) profileFields.social.youtube = youtube
        if (twitter) profileFields.social.twitter = twitter
        if (facebook) profileFields.social.facebook = facebook
        if (linkedin) profileFields.social.linkedin = linkedin
        if (instagram) profileFields.social.instagram = instagram

        // Database update
        try {
            let profile = await Profile.findOne({ user: req.user.id })

            if (profile) {
                // Update Profile
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                )
                console.log('- Updated Profile!'.yellow)
                return res.json(profile)
            }

            // Create Profile
            profile = new Profile(profileFields)
            await profile.save()

            console.log('- Created Profile!'.green)
            return res.json(profile)
        } catch (error) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
    }
)

/** ---------------------------- Get all profiles ----------------------------
 * @route   GET api/profile
 * @desc    Get all profiles
 * @access  Public
 */

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', [
            'name',
            'avatar'
        ])

        res.json(profiles)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

/** --------------------- Get Profile for mentioned user ---------------------
 * @route   GET api/profile/user/:user_id
 * @desc    Get profile by user id
 * @access  Public
 */

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar'])

        if (!profile) {
            console.error('- There is no profile for this user.'.red)
            return res.status(400).json({ msg: 'Profile Not Found' })
        }

        console.log('- Found Profile!'.yellow)
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        if (error.kind === 'ObjectId') {
            console.error('- There is no profile for this user.'.red)
            return res.status(400).json({ msg: 'Profile Not Found' })
        }
        res.status(500).send('Server Error')
    }
})

/** ----------------------------- Delete Profile -----------------------------
 * @route   DELETE api/profile/
 * @desc    Delete profile, user and posts
 * @access  Private
 */

router.delete('/', auth, async (req, res) => {
    try {
        // Remove user's posts
        await Post.deleteMany({ user: req.user.id })

        // Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id })

        // Remove user
        await User.findOneAndRemove({ _id: req.user.id })

        console.log('- User Deleted!'.red)
        res.json({ msg: 'User Deleted!' })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

/** ----------------------------- Add experience -----------------------------
 * @route   PUT api/profile/experience
 * @desc    Add profile experience
 * @access  Private
 */

router.put(
    '/experience',
    [
        auth,
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From Date is required').not().isEmpty()
    ],
    async (req, res) => {
        const errs = validationResult(req)

        if (!errs.isEmpty()) {
            console.log('- Title, Company, from-date are required!'.yellow)
            res.status(400).json({ errors: errs.array() })
        }

        const { title, company, location, from, to, current, description } =
            req.body

        const newExperience = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id })
            profile.experience.unshift(newExperience)
            await profile.save()

            console.log('- Added Experience!'.green)
            res.json(profile)
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
    }
)

/** ---------------------------- Delete experience ----------------------------
 * @route   DELETE api/profile/experience/:exp_id
 * @desc    Delete experience from profile
 * @access  Private
 */

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        // Get remove index
        const removeIdx = profile.experience
            .map((exp) => exp.id)
            .indexOf(req.params.exp_id)

        profile.experience.splice(removeIdx, 1)
        await profile.save()

        console.log('- Deleted Experience!'.red)
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

/** ----------------------------- Add Education -----------------------------
 * @route   PUT api/profile/education
 * @desc    Add profile education
 * @access  Private
 */

router.put(
    '/education',
    [
        auth,
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
        check('from', 'From Date is required').not().isEmpty()
    ],
    async (req, res) => {
        const errs = validationResult(req)

        if (!errs.isEmpty()) {
            console.log('- Title, Company, from-date are required!'.yellow)
            res.status(400).json({ errors: errs.array() })
        }

        const { school, degree, fieldofstudy, from, to, current, description } =
            req.body

        const newEducation = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id })
            profile.education.unshift(newEducation)
            await profile.save()

            console.log('- Added Education!'.green)
            res.json(profile)
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
    }
)

/** ---------------------------- Delete Education ----------------------------
 * @route   DELETE api/profile/education/:exp_id
 * @desc    Delete education from profile
 * @access  Private
 */

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        // Get remove index
        const removeIdx = profile.education
            .map((exp) => exp.id)
            .indexOf(req.params.edu_id)

        profile.education.splice(removeIdx, 1)
        await profile.save()

        console.log('- Deleted Education!'.red)
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

/** --------------------- Get user's GitHub Repositories ---------------------
 * @route   GET api/profile/github/:username
 * @desc    Get user repos from GitHub
 * @access  Public
 */

router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                'githubClientID'
            )}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }

        request(options, (err, response, body) => {
            if (err) console.error(err)

            if (response.statusCode !== 200) {
                console.log('- No github repos found!'.yellow)
                return res.status(404).json({ msg: 'No github repos found!' })
            }

            console.log('- Found Github repos!'.green)
            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

export default router
