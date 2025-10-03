const express = require('express');
const cors = require('cors');

const consolidationRouter = require('./routes/consolidation/consolidation.router');
const receiptRouter = require('./routes/receipt/receipt.router');
const requestRouter = require('./routes/request/request.router');

const app = express();

app.use(cors({
    origin: [
        'https://sparrow.nivakaran.dev',
        'http://localhost:3000',
        'http://nivakaran.dev'
    ]
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Sparrow: Consolidation Service" });
});

app.get('/health', (req, res) => {
    res.json({ message: "Consolidation Service is running.." });
});

// API Routes
app.use('/api/consolidations', consolidationRouter);
app.use('/api/receipts', receiptRouter);
app.use('/api/requests', requestRouter);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

module.exports = app;