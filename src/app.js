const express = require('express')


const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: "Sparrow: API Gateway"})
})

app.get('/health', (req, res) => {
    res.json({message: "API Gateway is running.."})
})


module.exports = app