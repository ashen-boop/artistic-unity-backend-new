
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const orderHandler = require('./orderHandler');
const driveService = require('./driveService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Artistic Unity Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Main order submission endpoint
app.post('/api/submit-order', upload.array('photos', 10), async (req, res) => {
  try {
    console.log('📦 Received order submission');
    
    const orderData = {
      customerInfo: req.body.customerInfo ? JSON.parse(req.body.customerInfo) : {},
      frameSelection: req.body.frameSelection ? JSON.parse(req.body.frameSelection) : {},
      collageSelection: req.body.collageSelection ? JSON.parse(req.body.collageSelection) : [],
      specialRequests: req.body.specialRequests || '',
      photos: req.files || []
    };

    // Process the order and save to Google Drive
    const result = await orderHandler.processOrder(orderData);
    
    res.json({
      success: true,
      message: 'Order submitted successfully!',
      orderId: result.orderId,
      driveFolderUrl: result.driveFolderUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Order submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit order',
      error: error.message
    });
  }
});

// Get order status endpoint
app.get('/api/order/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderInfo = await orderHandler.getOrderStatus(orderId);
    
    res.json({
      success: true,
      order: orderInfo
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Artistic Unity Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}`);
});

module.exports = app;
