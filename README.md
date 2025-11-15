# Artistic Unity Backend

Backend server for Artistic Unity that handles customer orders and automatically saves them to Google Drive.

## Features
- 📦 Processes customer orders from the website
- 🖼️ Handles photo uploads and storage
- 📁 Automatically organizes orders in Google Drive
- 🔗 Provides direct Drive folder links for order access
- 🚀 Deploys easily on Railway

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_private_key_here
GOOGLE_DRIVE_PARENT_FOLDER_ID=your_drive_folder_id
