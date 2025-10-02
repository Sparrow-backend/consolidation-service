const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({
    origin: [
        'https://sparrow.nivakaran.dev',
        'http://localhost:3000',
        'http://nivakaran.dev'
    ]
}))

app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: "Sparrow: API Gateway"})
})

app.get('/health', (req, res) => {
    res.json({message: "API Gateway is running.."})
})


module.exports = app