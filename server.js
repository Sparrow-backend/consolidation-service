const http = require('http')
const app = require('./src/app')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const PORT = process.env.PORT || 8001
const MONGODB_URI = process.env.MONGODB_URI

const server = http.createServer(app)

mongoose.connection.once('open', () => {
    console.log("MongoDB is ready!")
})

mongoose.connection.on('error', () => {
    console.error('Error in connecting with MongoDB')
})

async function createServer() {
    try {
        mongoose.connect(MONGODB_URI)

        console.log('Connected to MongoDB!')

        server.listen(PORT, () => {
            console.log(`Consolidation Service: Listening on port ${PORT}...`)
        })
    } catch(err) {
        console.error("Consolidation service: Internal server error", err)
    }
}

createServer()