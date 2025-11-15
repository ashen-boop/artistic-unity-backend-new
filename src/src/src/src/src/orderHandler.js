const driveService = require('./driveService');

class OrderHandler {
  constructor() {
    this.orders = new Map(); // In production, use a database
  }

  async processOrder(orderData) {
    try {
      console.log('🔄 Processing order...');
      
      // Generate unique order ID
      const orderId = this.generateOrderId();
      const timestamp = new Date().toISOString();
      
      // Create order object
      const order = {
        id: orderId,
        timestamp: timestamp,
        status: 'processing',
        ...orderData
      };

      // Save to Google Drive
      const driveResult = await driveService.saveOrderToDrive(order);
      
      // Store order reference
      this.orders.set(orderId, {
        ...order,
        driveFolderId: driveResult.folderId,
        driveFolderUrl: driveResult.folderUrl,
        status: 'completed'
      });

      console.log(`✅ Order ${orderId} processed successfully`);
      
      return {
        orderId: orderId,
        driveFolderUrl: driveResult.folderUrl,
        timestamp: timestamp
      };

    } catch (error) {
      console.error('❌ Order processing failed:', error);
      throw new Error(`Order processing failed: ${error.message}`);
    }
  }

  async getOrderStatus(orderId) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD_${timestamp}_${random}`.toUpperCase();
  }
}

module.exports = new OrderHandler();
