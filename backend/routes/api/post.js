import express from 'express'
import { check, validationResult } from 'express-validator'
import colors from 'colors'

import auth from '../../middleware/auth.js'
import User from '../../models/User.js'
import Post from '../../models/Post.js'

const router = express.Router()

/** ------------------------------- Create Post ------------------------------
 * @route   POST api/post
 * @desc    Create Post
 * @access  Private
 */
router.post(
    '/',
    [auth, [check('text', 'Text is required!').not().isEmpty()]],
    async (req, res) => {
        const errs = validationResult(req)

        if (!errs.isEmpty()) {
            console.error('- Some fields are required!'.red)
            return res.status(400).json({ errors: errs.array() })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })

            await newPost.save()

            console.log('- Post Created!'.green)
            res.json(post)
        } catch (err) {
            console.log(err.message)
            return res.status(500).send('Server Error')
        }
    }
)

/** ------------------------------- Get all Posts ------------------------------
 * @route   GET api/post
 * @desc    Get all posts
 * @access  Private
 */

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 })

        console.log('- Got all posts'.yellow)
        res.json(posts)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error')
    }
})

/** ------------------------------- Get a Post ------------------------------
 * @route   GET api/post/:id
 * @desc    Get Post by ID
 * @access  Private
 */

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        // Check post
        if (!post) {
            console.error('- Post Not Found!'.red)
            res.status(404).json({ msg: 'Post Not Found!' })
        }

        console.log('- Got a post'.yellow)
        res.json(post)
    } catch (err) {
        console.log(err.message)

        if (err.kind === 'ObjectId') {
            return res.status(500).send('Server Error')
        }
    }
})

/** ------------------------------- Delete a Post ------------------------------
 * @route   DELETE api/post/:id
 * @desc    Delete a Post by ID
 * @access  Private
 */

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        // Check post
        if (!post) {
            console.error('- Post Not Found!'.red)
            return res.status(404).json({ msg: 'Post Not Found!' })
        }

        // Check user
        if (post.user.toString() !== req.user.id) {
            console.error('- User not authorized!'.yellow)
            return res.status(401).json({ msg: 'User not authorized!' })
        }

        await post.remove()

        console.error('- Post Removed!'.red)
        res.json({ msg: 'Post Removed!' })
    } catch (err) {
        console.log(err.message)

        if (err.kind === 'ObjectId') {
            return res.status(500).send('Server Error')
        }
    }
})

/** ------------------------------- Like a Post ------------------------------
 * @route   PUT api/post/like/:id
 * @desc    Like a post
 * @access  Private
 */

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        // Check if post is already liked
        if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
                .length > 0
        ) {
            console.error('- Post already liked!'.yellow)
            return res.status(400).json({ msg: 'Post already liked!' })
        }

        // Like post
        post.likes.unshift({ user: req.user.id })
        await post.save()

        console.log('- Liked Post'.green)
        res.json(post.likes)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error')
    }
})

/** ------------------------------- Unlike a Post ------------------------------
 * @route   PUT api/post/unlike/:id
 * @desc    Unlike a post
 * @access  Private
 */

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        // Check if post is already liked
        if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
                .length === 0
        ) {
            console.error('- Post NOT liked yet!'.yellow)
            return res.status(400).json({ msg: 'Post has not yet been liked!' })
        }

        // Get remove index
        const removeIdx = post.likes
            .map((like) => like.user.toString())
            .indexOf(req.user.id)

        post.likes.splice(removeIdx, 1)
        await post.save()

        console.log('- Unliked Post'.red)
        res.json(post.likes)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error')
    }
})

/** ------------------------------- Comment on Post ------------------------------
 * @route   POST api/post/comment/:id
 * @desc    Comment on a post
 * @access  Private
 */
router.post(
    '/comment/:id',
    [auth, [check('text', 'Text is required!').not().isEmpty()]],
    async (req, res) => {
        const errs = validationResult(req)

        if (!errs.isEmpty()) {
            console.error('- Some fields are required!'.red)
            return res.status(400).json({ errors: errs.array() })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')
            const post = await Post.findById(req.params.id)

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment)
            post.save()

            console.log('- Posted a comment!'.green)
            res.json(post.comments)
        } catch (err) {
            console.log(err.message)
            return res.status(500).send('Server Error')
        }
    }
)

/** ------------------------------- Delete a comment ------------------------------
 * @route   POST api/post/comment/:id/:comment_id
 * @desc    Delete comment on a post
 * @access  Private
 */

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        // Get comment
        const comment = post.comments.find(
            (comment) => comment.id.toString() === req.params.comment_id
        )

        // Make sure comment exists
        if (!comment) {
            console.error('- Comment does not exists!'.red)
            return res.status(404).json({ msg: 'Comment does not exists!' })
        }

        // check user
        if (comment.user !== req.user.id) {
            console.error('- User not authorized!'.yellow)
            return res.status(401).json({ msg: 'User not authorized!' })
        }

        // Get remove index
        const removeIdx = post.comments
            .map((comment) => comment.user.toString())
            .indexOf(req.user.id)

        post.comments.splice(removeIdx, 1)

        await post.save()

        console.log('- Deleted comment!'.red)
        res.json(post.comments)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error')
    }
})

export default router
