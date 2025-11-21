const express = require('express');
const cors = require('cors');
const app = express();
const productRoutes = require('./routes/productRoute');
const orderRoutes = require('./routes/orderRoute');
const paymentRoutes = require('./routes/paymentRoute');
const analyticsRoutes = require('./routes/analyticsRoute');
const authRoutes = require('./routes/auth');

// FIXED: Removed trailing slash and added multiple origins
app.use(cors({
    origin: [
        'https://frontend-sandy-iota-83.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the E-Commerce API",
        endpoints: {
            auth: "/api/auth",
            products: "/api/products",
            orders: "/api/orders",
            payments: "/api/payments",
            analytics: "/api/analytics"
        }
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

module.exports = app;