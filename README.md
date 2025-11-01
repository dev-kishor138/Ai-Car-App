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

## Folder Structure

```bash
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
│ ├── userController.js
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
```

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

## Environment Variables

Create a `.env` file in the root folder with the following variables:

- `PORT` – The port on which the server will run (e.g., `5000`)
- `MONGO_URI` – MongoDB connection string
- `JWT_SECRET` – Secret key for JWT authentication
- `EMAIL_USER` – Email address for sending notifications
- `EMAIL_PASS` – Email password or app password
- `STRIPE_SECRET_KEY` – Stripe API secret key for payments
- `CLOUDINARY_CLOUD_NAME` – Cloudinary cloud name
- `CLOUDINARY_API_KEY` – Cloudinary API key
- `CLOUDINARY_API_SECRET` – Cloudinary API secret
- `PUSHER_APP_ID` – Pusher App ID
- `PUSHER_KEY` – Pusher Key
- `PUSHER_SECRET` – Pusher Secret
- `PUSHER_CLUSTER` – Pusher Cluster
