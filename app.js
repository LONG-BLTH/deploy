const express = require('express');
const cors = require('cors');
const app = express();
const productRoutes = require('./routes/productRoute');
const orderRoutes = require('./routes/orderRoute');
const paymentRoutes = require('./routes/paymentRoute');
const analyticsRoutes = require('./routes/analyticsRoute');
const authRoutes = require('./routes/auth');

app.use(cors());
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