# Drivest Backend API

**Node.js/Express REST API** for the Drivest platform. This backend provides authentication, car management, subscription handling, payments, notifications, and AI integration.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Models](#models)
- [Middleware](#middleware)
- [Deployment](#deployment)

---

## 🎯 Overview

The Drivest backend is a comprehensive REST API built with Node.js and Express that powers:

- User authentication and authorization
- Car listings management
- AI-powered car analysis
- Subscription and payment processing
- Real-time notifications
- Image upload and management
- Email notifications

---

## ✨ Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Google OAuth login
- ✅ Firebase authentication
- ✅ Role-based access control (Admin, User, Dealer)
- ✅ Password reset with OTP
- ✅ Email verification

### Car Management
- ✅ CRUD operations for cars
- ✅ Car search and filtering
- ✅ Car comparison
- ✅ Brand management
- ✅ Favorite/saved cars

### Subscription & Payments
- ✅ Stripe payment integration
- ✅ Subscription plans management
- ✅ Invoice generation
- ✅ Usage tracking
- ✅ Subscription status checking

### Notifications
- ✅ Real-time notifications via Pusher
- ✅ Email notifications
- ✅ Push notifications
- ✅ Notification management

### AI Integration
- ✅ Car analysis
- ✅ AI-powered recommendations
- ✅ Car comparison with AI
- ✅ Scraped car data import

### Additional Features
- ✅ Image upload to Cloudinary
- ✅ Soft delete functionality
- ✅ Error handling middleware
- ✅ Support ticket system
- ✅ Usage logging

---

## 🛠️ Tech Stack

- **Runtime:** Node.js >= 18
- **Framework:** Express.js 4.21.2
- **Database:** MongoDB (Mongoose 8.9.6)
- **Authentication:** JWT, Firebase Admin, Google Auth
- **Payment:** Stripe 19.1.0
- **Storage:** Cloudinary 1.41.3
- **Real-time:** Pusher 5.2.0
- **Email:** Nodemailer 7.0.7
- **File Upload:** Multer 2.0.2
- **Security:** bcrypt 5.1.1, CORS

---

## 📦 Installation

### Prerequisites

- Node.js >= 18.x
- MongoDB database
- npm or yarn

### Setup Steps

1. **Clone and navigate:**
```bash
cd drivest-ai
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Start development server:**
```bash
npm run dev
```

6. **Start production server:**
```bash
npm start
```

The server will run on `http://localhost:5000` (or your configured PORT).

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/drivest
# or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/drivest

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher Real-time Notifications
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Firebase Admin (Optional)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 📁 Project Structure

```
drivest-ai/
├── api/
│   └── index.js                 # Vercel serverless function
├── src/
│   ├── app.js                   # Express app configuration
│   ├── server.js                # Server entry point
│   ├── config/
│   │   ├── cloudinary.js        # Cloudinary configuration
│   │   ├── dbConnect.js         # MongoDB connection
│   │   ├── firebaseAdmin.js     # Firebase Admin setup
│   │   ├── pusher.js            # Pusher configuration
│   │   └── rapidClient.js       # RapidAPI client
│   ├── controllers/
│   │   ├── aiController.js      # AI-related endpoints
│   │   ├── authController.js    # Authentication logic
│   │   ├── brandController.js   # Brand management
│   │   ├── carController.js     # Car CRUD operations
│   │   ├── favoriteController.js # Favorites management
│   │   ├── googleLogin.js       # Google OAuth handler
│   │   ├── notificationController.js # Notifications
│   │   ├── subscriptionController.js # Subscriptions & payments
│   │   ├── ticketController.js  # Support tickets
│   │   ├── userController.js    # User management (admin)
│   │   └── userProfileController.js # User profile
│   ├── lib/
│   │   ├── DevBuildError.js     # Development error handler
│   │   ├── emailTemplates.js    # Email templates
│   │   ├── generateToken.js     # JWT token generation
│   │   ├── mailer.js            # Email sending utility
│   │   ├── softDeletePlugin.js # Mongoose soft delete plugin
│   │   └── utilityFunction.js   # Utility functions
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authentication
│   │   ├── checkSubscription.js # Subscription checker
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── firebaseAuth.js      # Firebase auth middleware
│   │   └── roleMiddleware.js    # Role-based access control
│   ├── models/
│   │   ├── AiEnrichment.js      # AI enrichment data
│   │   ├── Brand.js             # Car brands
│   │   ├── Car.js               # Car listings
│   │   ├── Dealership.js        # Dealerships
│   │   ├── Favourite.js         # User favorites
│   │   ├── Invoice.js            # Payment invoices
│   │   ├── Lead.js               # Sales leads
│   │   ├── MediaAsset.js         # Media files
│   │   ├── Notification.js      # Notifications
│   │   ├── OtpCode.js            # OTP codes
│   │   ├── Plan.js               # Subscription plans
│   │   ├── ScrapeJob.js          # Scraping jobs
│   │   ├── Session.js            # User sessions
│   │   ├── Subscription.js       # User subscriptions
│   │   ├── Ticket.js             # Support tickets
│   │   ├── UsageLog.js           # Usage tracking
│   │   └── User.js               # User accounts
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin endpoints
│   │   ├── aiRoutes.js            # AI endpoints
│   │   ├── globalRoutes.js       # Public routes
│   │   ├── pusherRoutes.js       # Pusher auth
│   │   ├── subscriptionRoutes.js # Subscription endpoints
│   │   └── userRoutes.js         # User endpoints
│   ├── service/
│   │   └── autoscoutService.js   # Autoscout scraping service
│   └── storage/
│       └── imageParser.js        # Image upload parser
├── package.json
├── vercel.json                   # Vercel configuration
└── README.md
```

---

## 🛣️ API Routes

### Base URL
```
Development: http://localhost:5000
Production: https://api.drivestai.com
```

### Global Routes (Public)

#### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /google-login` - Google OAuth login
- `POST /refresh-token` - Refresh JWT token
- `POST /forgot-password` - Send OTP for password reset
- `POST /verify-otp` - Verify OTP code
- `POST /reset-password` - Reset password with OTP

### User Routes (Protected - Requires Authentication)

#### Profile Management
- `GET /user/profile` - Get user profile
- `PUT /user/edit-profile` - Update profile (with image upload)
- `PUT /user/change-password` - Change password
- `PUT /user/deactivate` - Deactivate account

#### Car Operations
- `GET /user/cars` - Search and filter cars
- `GET /user/cars-details/:id` - Get car details
- `GET /user/cars/compare` - Compare cars
- `GET /user/get-brands` - Get all car brands

#### Favorites
- `POST /user/favorites/toggle` - Toggle favorite status
- `POST /user/favorites` - Add favorite
- `DELETE /user/favorites/:carId` - Remove favorite
- `GET /user/favorites` - Get user's favorites (paginated)
- `GET /user/favorites/:carId/is-favorited` - Check if favorited
- `GET /user/cars/:carId/favorites/count` - Get favorite count

#### Notifications
- `GET /user/notifications` - Get user notifications
- `PUT /user/notification-read` - Mark notification as read
- `PUT /user/notifications-all-read` - Mark all as read
- `DELETE /user/notification/:id` - Delete notification

#### Other
- `GET /user/brands` - Get brands
- `POST /user/create-ticket` - Create support ticket
- `GET /user/invoices` - Get user invoices

### Admin Routes (Protected - Requires Admin Role)

#### User Management
- `GET /admin/user-list` - Get all users
- `POST /admin/create-user` - Create new user
- `PUT /admin/edit-user/:userId` - Edit user
- `DELETE /admin/delete-user/:userId` - Delete user
- `PUT /admin/approved-user/:userId` - Approve user
- `PUT /admin/reject-user/:userId` - Reject user
- `PUT /admin/status-update/:userId` - Update user status
- `PUT /admin/reset-password` - Reset user password

#### Car Management
- `GET /admin/cars` - Get all cars (with filters)
- `DELETE /admin/car/:id` - Delete car

#### Other
- `GET /admin/tickets` - Get all support tickets
- `DELETE /admin/notification/:id` - Delete notification
- `GET /admin/invoices` - Get all invoices
- `PUT /admin/edit-profile` - Update admin profile
- `PUT /admin/change-password` - Change admin password

### AI Routes

- `POST /ai/import-cars` - Import scraped car data
- `POST /ai/analyze` - Analyze cars with AI
- `POST /ai/compare` - Compare cars with AI
- `POST /ai/suggest` - Get AI recommendations

### Subscription Routes (Protected)

- `POST /subscription/create` - Create Stripe checkout session

### Webhook Routes

- `POST /stripe/webhook` - Stripe webhook handler (no auth required)

### Pusher Routes

- `POST /api/pusher/auth` - Pusher authentication endpoint

---

## 🔒 Authentication

### JWT Authentication

Most routes require a JWT token in the Authorization header:

```javascript
Authorization: Bearer <jwt_token>
```

### Token Generation

Tokens are generated on login and include:
- User ID
- Email
- Role

### Token Refresh

Use the refresh token endpoint to get a new access token:

```bash
POST /refresh-token
Body: { "refreshToken": "..." }
```

---

## 📊 Models

### User Model
- Basic info (name, email, password)
- Role (user, admin, dealer)
- Status (pending, approved, rejected, deactivated)
- Subscription info
- Profile image

### Car Model
- Basic info (title, brand, model, year)
- Price and specifications
- Images
- Location
- Status (active, sold, deleted)

### Subscription Model
- User reference
- Plan reference
- Status (active, expired, cancelled)
- Start/end dates
- Stripe subscription ID

### Notification Model
- User reference
- Title and message
- Type
- Read status
- Timestamp

---

## 🛡️ Middleware

### Authentication Middleware
- `isAuthenticated` - Verifies JWT token
- `isAdmin` - Checks admin role
- `isUser` - Checks user role
- `isDealer` - Checks dealer role

### Subscription Middleware
- `checkSubscription` - Verifies active subscription

### Error Handling
- Global error handler catches all errors
- Returns formatted error responses

---

## 🚀 Deployment

### Vercel Deployment

The project includes `vercel.json` for serverless deployment:

```bash
vercel deploy
```

### Environment Variables on Vercel

Set all environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all variables from `.env` file

### Manual Deployment

1. **Build:**
```bash
npm install --production
```

2. **Start:**
```bash
npm start
```

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Verify `MONGO_URI` is correct
   - Check MongoDB is running
   - Verify network access

2. **JWT Token Errors:**
   - Check `JWT_SECRET` is set
   - Verify token expiration
   - Check token format in requests

3. **Cloudinary Upload Errors:**
   - Verify Cloudinary credentials
   - Check file size limits
   - Verify image format

4. **Stripe Webhook Errors:**
   - Verify webhook secret
   - Check webhook endpoint URL
   - Verify Stripe event types

---

## 📝 Notes

- Uses ES6 modules (`type: "module"` in package.json)
- Soft delete plugin for data retention
- Error handling middleware for consistent error responses
- CORS enabled for cross-origin requests
- Cookie parser for session management

---

## 🔗 Related Documentation

- [AI Service Documentation](../Car-Price-Analysis-and-Buy-Recommendations/README.md)
- [Mobile App Documentation](../Drivest_final2/README.md)
- [Admin Dashboard Documentation](../Admin-Dashboard/README.md)
- [Main Project README](../README.md)

---

**Built with Node.js & Express**
