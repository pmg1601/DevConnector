/* -------------------------------------------------------------------------- */
/*                             Connect to database                            */
/* -------------------------------------------------------------------------- */

import mongoose from 'mongoose'
import config from 'config'
import colors from 'colors'

const MONGO_URI = config.get('mongoURI')

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        console.log(`MongoDB Connected - ${MONGO_URI} !\n`.cyan)
    } catch (error) {
        console.log(error.message)
        process.exit(1) // Exit process with failure
    }
}

export default connectDB
