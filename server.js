import express from 'express'
import colors from 'colors'
import connectDB from './config/db.js'
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
app.get('/', (req, res) => res.send('API Running!'))

app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/post', postRoutes)

/* -------------------------------------------------------------------------- */

// Start Listening
app.listen(PORT, () =>
    console.log(`Server Running on http://localhost:${PORT}`.cyan)
)

console.log('\n')
