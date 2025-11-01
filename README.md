# Drivest AI car Inspection

This repository contains the backend for the Drivest projects, built with **Node.js** and **MongoDB**.  
It includes API routes, controllers, models, middleware, and integrations for notifications, payments, emails, and cloud storage.

---

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

The backend provides REST APIs for the Drivest platform including:

- User authentication and authorization (JWT)
- CRUD operations for cars, brands, users, subscriptions, notifications, AI enrichment, and more
- Payment processing with Stripe
- Email notifications
- Real-time notifications using Pusher
- Image upload and management with Cloudinary
- AI integration and scraping services

---

## Features

- JWT-based authentication
- Email verification and notifications
- Stripe payment integration
- Pusher real-time notifications
- Cloudinary for image uploads
- AI enrichment and scraping services
- Soft delete plugin for models
- Subscription and plan management

---

## Folder Structure

root
│ package.json
│ README.md
│ .gitignore
│ .env
│
├── api
│ └── index.js
│
└── src
├── app.js
├── server.js
├── config
│ ├── cloudinary.js
│ ├── dbConnect.js
│ ├── firebaseAdmin.js
│ ├── pusher.js
│ └── rapidClient.js
│
├── controller
│ ├── aiController.js
│ ├── brandController.js
│ ├── carController.js
│ ├── favoriteController.js
│ ├── googleLogin.js
│ ├── notificationController.js
│ ├── subscriptionController.js
│ └── userController.js
│ └── userProfileController.js
│
├── lib
│ ├── DevBuildError.js
│ ├── emailTemplates.js
│ ├── generateToken.js
│ ├── mailer.js
│ ├── softDeletePlugin.js
│ └── utilityFunction.js
│
├── middleware
│ ├── authMiddleware.js
│ ├── checkSubscription.js
│ ├── errorHandler.js
│ ├── firebaseAuth.js
│ └── roleMiddleware.js
│
├── models
│ ├── AiEnrichment.js
│ ├── Brand.js
│ ├── Car.js
│ ├── Dealership.js
│ ├── Favourite.js
│ ├── Invoice.js
│ ├── Lead.js
│ ├── MediaAsset.js
│ ├── Notification.js
│ ├── OtpCode.js
│ ├── Plan.js
│ ├── ScrapeJob.js
│ ├── Session.js
│ ├── Subscription.js
│ ├── Ticket.js
│ ├── UsageLog.js
│ └── User.js
│
├── routes
│ ├── adminRoutes.js
│ ├── aiRoutes.js
│ ├── userRoutes.js
│ ├── globalRoutes.js
│ ├── pusherRoutes.js
│ └── subscriptionRoutes.js
│
├── service
│ └── autoscoutService.js
│
└── storage
└── imageParser.js

## Features

- JWT authentication & authorization
- Role-based access control
- CRUD operations for users, cars, brands, subscriptions, and more
- Notifications via **Pusher**
- Payment integration using **Stripe**
- Email sending with **SMTP** (email & password)
- Image uploads and management with **Cloudinary**
- AI feature integration
- Soft delete functionality for models

## Installation

npm install

### Prerequisites

- Node.js >= 18
- npm or yarn
- MongoDB instance

### Clone the Repository

```bash
git clone https://github.com/your-username/drivest-backend.git
cd drivest-backend
```

### Environment Variables

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
