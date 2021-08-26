import express from 'express'
import colors from 'colors'
import connectDB from './config/db.js'
import path from 'path'

import userRoutes from './routes/api/users.js'
import authRoutes from './routes/api/auth.js'
import profileRoutes from './routes/api/profile.js'
import postRoutes from './routes/api/post.js'

/* -------------------------------------------------------------------------- */

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB database
connectDB()

// Init middleware
app.use(express.json({ extended: false }))

// Define Routes
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/post', postRoutes)

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // set static folder
    app.use(express.static('fronend/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
    })
}

/* -------------------------------------------------------------------------- */

// Start Listening
app.listen(PORT, () =>
    console.log(`Server Running on http://localhost:${PORT}`.cyan)
)

console.log('\n')
