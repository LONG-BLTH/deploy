# Exercise 5: Analytics & Aggregation

## Objective
Learn MongoDB aggregation pipeline to perform complex data analysis across Products, Orders, and Payments collections.

## Prerequisites
- Completed Exercises 1-4
- Have sample data in Products, Orders, and Payments collections

## Your Tasks

Implement 11 analytics endpoints using MongoDB aggregation pipeline.

### Product Analytics

#### 1. Get Products Count
```javascript
const getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

#### 2. Get Products by Category
Use `$group` to count products and calculate average price per category:

```javascript
const result = await Product.aggregate([
  {
    $group: {
      _id: '$category',
      count: { $sum: 1 },
      avgPrice: { $avg: '$price' }
    }
  },
  { $sort: { count: -1 } }
]);
```

#### 3. Get Total Inventory Value
Calculate `price * stock` for each product, then sum:

```javascript
const result = await Product.aggregate([
  {
    $project: {
      value: { $multiply: ['$price', '$stock'] }
    }
  },
  {
    $group: {
      _id: null,
      totalValue: { $sum: '$value' }
    }
  }
]);
```

### Order Analytics

#### 4. Get Order Statistics
Calculate total orders, revenue, and average order value:

```javascript
const stats = await Order.aggregate([
  {
    $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalRevenue: { $sum: '$totalAmount' },
      avgOrderValue: { $avg: '$totalAmount' }
    }
  }
]);
```

#### 5. Get Orders by Status
```javascript
const result = await Order.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$totalAmount' }
    }
  },
  { $sort: { totalAmount: -1 } }
]);
```

#### 6. Get Recent Orders (Last 30 Days)
```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const orders = await Order.find({
  createdAt: { $gte: thirtyDaysAgo }
}).sort({ createdAt: -1 });
```

#### 7. Get Top 5 Most Ordered Products
This is complex - requires `$unwind`, `$group`, `$lookup`:

```javascript
const topProducts = await Order.aggregate([
  { $unwind: '$items' },  // Deconstruct items array
  {
    $group: {
      _id: '$items.product',
      totalQuantity: { $sum: '$items.quantity' },
      totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
    }
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 5 },
  {
    $lookup: {  // Join with Product collection
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'productDetails'
    }
  },
  { $unwind: '$productDetails' },
  {
    $project: {
      productId: '$_id',
      name: '$productDetails.name',
      category: '$productDetails.category',
      totalQuantity: 1,
      totalRevenue: 1
    }
  }
]);
```

### Payment Analytics

#### 8. Get Payments by Method
```javascript
const result = await Payment.aggregate([
  {
    $group: {
      _id: '$paymentMethod',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  },
  { $sort: { totalAmount: -1 } }
]);
```

#### 9. Get Payment Success Rate
```javascript
const total = await Payment.countDocuments();
const completed = await Payment.countDocuments({ status: 'Completed' });
const successRate = total > 0 ? (completed / total) * 100 : 0;

res.status(200).json({
  success: true,
  data: {
    totalPayments: total,
    completedPayments: completed,
    successRate: successRate.toFixed(2) + '%'
  }
});
```

#### 10. Get Revenue by Status
```javascript
const result = await Payment.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalRevenue: { $sum: '$amount' }
    }
  }
]);
```

#### 11. Get Daily Revenue (with date range)
```javascript
const getDailyRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const result = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailyRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## Routes Setup

In `routes/analyticsRoute.js`:

```javascript
// Product analytics
router.get('/products/count', analyticsController.getProductsCount);
router.get('/products/by-category', analyticsController.getProductsByCategory);
router.get('/products/value', analyticsController.getInventoryValue);

// Order analytics
router.get('/orders/stats', analyticsController.getOrderStats);
router.get('/orders/by-status', analyticsController.getOrdersByStatus);
router.get('/orders/recent', analyticsController.getRecentOrders);
router.get('/orders/top-products', analyticsController.getTopProducts);

// Payment analytics
router.get('/payments/by-method', analyticsController.getPaymentsByMethod);
router.get('/payments/success-rate', analyticsController.getPaymentSuccessRate);
router.get('/payments/revenue', analyticsController.getRevenueByStatus);
router.get('/payments/daily', analyticsController.getDailyRevenue);
```

Mount in app.js:
```javascript
const analyticsRoutes = require('./routes/analyticsRoute');
app.use('/api/analytics', analyticsRoutes);
```

## Testing

```bash
# Product analytics
GET /api/analytics/products/count
GET /api/analytics/products/by-category
GET /api/analytics/products/value

# Order analytics
GET /api/analytics/orders/stats
GET /api/analytics/orders/by-status
GET /api/analytics/orders/recent
GET /api/analytics/orders/top-products

# Payment analytics
GET /api/analytics/payments/by-method
GET /api/analytics/payments/success-rate
GET /api/analytics/payments/revenue
GET /api/analytics/payments/daily?startDate=2024-01-01&endDate=2024-12-31
```

## Aggregation Pipeline Stages

### Essential Stages

1. **$match** - Filter documents (like WHERE in SQL)
   ```javascript
   { $match: { status: 'Completed' } }
   ```

2. **$group** - Group by field and calculate aggregations
   ```javascript
   {
     $group: {
       _id: '$category',
       total: { $sum: 1 },
       avg: { $avg: '$price' }
     }
   }
   ```

3. **$project** - Select/transform fields
   ```javascript
   {
     $project: {
       name: 1,
       value: { $multiply: ['$price', '$stock'] }
     }
   }
   ```

4. **$sort** - Sort results
   ```javascript
   { $sort: { total: -1 } }  // -1 = descending, 1 = ascending
   ```

5. **$limit** - Limit number of results
   ```javascript
   { $limit: 5 }
   ```

6. **$unwind** - Deconstruct array field
   ```javascript
   { $unwind: '$items' }  // Creates one document per array element
   ```

7. **$lookup** - Join with another collection
   ```javascript
   {
     $lookup: {
       from: 'products',
       localField: 'productId',
       foreignField: '_id',
       as: 'productDetails'
     }
   }
   ```

### Aggregation Operators

- **$sum** - Sum values or count documents
- **$avg** - Calculate average
- **$min** / **$max** - Min/max values
- **$multiply** - Multiply values
- **$dateToString** - Format dates

## Key Concepts

1. **Pipeline Structure** - Array of stages processed sequentially
2. **$group with _id: null** - Aggregate all documents into one
3. **$unwind** - Essential for analyzing array fields
4. **$lookup** - Performs left outer join
5. **Date Filtering** - Use JavaScript Date objects with $gte/$lte
6. **Performance** - Use indexes on frequently queried fields

## Tips

- Test each pipeline stage incrementally
- Use MongoDB Compass to visualize aggregation
- $match early in pipeline for better performance
- $project only needed fields to reduce data size
- Use $lookup sparingly (can be slow on large datasets)
- Add indexes on fields used in $match and $group
