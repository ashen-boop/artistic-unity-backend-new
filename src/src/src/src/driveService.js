
const { google } = require('googleapis');
const path = require('path');

class DriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.initializeDrive();
  }

  async initializeDrive() {
    try {
      // Authentication will use environment variables from Railway
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      console.log('✅ Google Drive service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
      throw error;
    }
  }

  async saveOrderToDrive(order) {
    try {
      console.log('💾 Saving order to Google Drive...');

      // Create customer folder
      const folderName = this.generateFolderName(order);
      const folderId = await this.createFolder(folderName);

      // Save order details as JSON file
      await this.saveOrderDetails(folderId, order);

      // Save photos if any
      if (order.photos && order.photos.length > 0) {
        await this.savePhotos(folderId, order.photos);
      }

      // Save collage selections
      if (order.collageSelection && order.collageSelection.length > 0) {
        await this.saveCollageSelections(folderId, order.collageSelection);
      }

      const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
      
      console.log(`✅ Order saved to Drive: ${folderUrl}`);
      
      return {
        folderId: folderId,
        folderUrl: folderUrl,
        folderName: folderName
      };

    } catch (error) {
      console.error('❌ Failed to save order to Drive:', error);
      throw error;
    }
  }

  async createFolder(folderName) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID],
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });

      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to create folder:', error);
      throw error;
    }
  }

  async saveOrderDetails(folderId, order) {
    const orderDetails = {
      orderId: order.id,
      timestamp: order.timestamp,
      customerInfo: order.customerInfo,
      frameSelection: order.frameSelection,
      specialRequests: order.specialRequests,
      driveFolderUrl: `https://drive.google.com/drive/folders/${folderId}`
    };

    const fileMetadata = {
      name: 'order_details.json',
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(orderDetails, null, 2),
    };

    await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
  }

  async savePhotos(folderId, photos) {
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileMetadata = {
        name: `customer_photo_${i + 1}${path.extname(photo.originalname)}`,
        parents: [folderId],
      };

      const media = {
        mimeType: photo.mimetype,
        body: Buffer.from(photo.buffer),
      };

      await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });
    }
  }

  async saveCollageSelections(folderId, collages) {
    const fileMetadata = {
      name: 'collage_selections.json',
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify({ collages }, null, 2),
    };

    await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
  }

  generateFolderName(order) {
    const customerName = order.customerInfo?.customerName?.replace(/[^a-zA-Z0-9]/g, '_') || 'UnknownCustomer';
    const date = new Date().toISOString().split('T')[0];
    return `${customerName}_${date}_${order.id}`;
  }
}

module.exports = new DriveService();
