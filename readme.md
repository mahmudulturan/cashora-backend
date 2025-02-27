# Cashora - MFS (Mobile Financial Service) Backend

A secure and scalable Mobile Financial Service backend built with TypeScript, Express.js and MongoDB. This project implements financial transactions, user management, and agent operations with proper security measures.

## 🚀 Key Features

- **Multi-Role Authentication**: Separate authentication for Users, Agents, and Admin
- **Financial Operations**: 
  - Send Money (User to User)
  - Cash In (Agent to User)
  - Cash Out (User to Agent)
  - Balance Management
- **Security Features**:
  - JWT-based authentication
  - PIN encryption
  - Single device login
  - Transaction verification
- **Admin Controls**:
  - User/Agent management
  - Transaction monitoring
  - Agent approval system
  - System balance monitoring
- **Agent Operations**:
  - Balance recharge requests
  - Withdrawal management
  - User cash-in/cash-out handling

## 🛠️ Tech Stack

- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- JWT
- Zod
- Winston
- Swagger
- Pug
- Nodemailer

## ⚡ Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.x or higher)
- npm (v8.x or higher)
- MongoDB (v6.x or higher)


## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/mahmudulturan/cashora-backend.git
cd cashora-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and set the environment variables:

```bash
cp .env.example .env
```


4. Start the development server:

```bash
npm run dev
```


## 🚀 Scripts

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build the project for production
- `npm start`: Run the production server
- `npm run vercel-build`: Build for Vercel deployment

## 📁 Project Structure

```bash
src/
├── app/
│ ├── builder/ # Query builder utilities
│ ├── configs/ # Configuration files
│ ├── constants/ # Constants and enums
│ ├── docs/ # API documentation
│ ├── errors/ # Custom error handlers
│ ├── interfaces/ # TypeScript interfaces
│ ├── middlewares/ # Express middlewares
│ ├── modules/ # Feature modules
│ ├── routes/ # API routes
│ ├── utils/ # Utility functions
│ └── views/ # Pug templates
```

## 🔐 API Endpoints

### 1. Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - Login with mobile/email & PIN
- `GET /auth/logout` - Logout (invalidate token)
- `POST /auth/token/refresh` - Refresh token
- `PATCH /auth/pin/change` - Change PIN
- `POST /auth/pin/reset-email/:email` - Send reset PIN email
- `POST /auth/pin/reset/verify-otp` - Verify reset PIN OTP
- `PATCH /auth/pin/reset/:token` - Reset PIN

### 2. User
- `GET /users/all` - Get all users (admin only)
- `GET /users/me` - Get logged-in user details
- `PUT /users/me` - Update user profile
- `PATCH /users/status/:id` - Update user status (admin only)
- `DELETE /users/:id` - Delete user (admin only)

### 3. Transaction
- `POST /transactions/send-money` - Send money to another user
- `POST /transactions/cash-in` - Deposit money via an agent
- `POST /transactions/cash-out` - Withdraw money via an agent
- `GET /transactions/history` - Get logged-in user/agent transaction history
- `GET /transactions/all-history` - Get all transactions (admin only)

### 7. Notification
- `GET /notifications` - Get user notifications
- `POST /notifications/send` - Send notification (internal use)

## 💰 Transaction Fees

- Send Money: 5 taka (for transactions over 100 taka)
- Cash Out: 1.5% of transaction amount
  - Agent receives 1%
  - Admin receives 0.5%
- Cash In: No fee
- Admin receives 5 taka for all operations

## 🛡️ Security Features
- Encrypted PIN storage
- Rate limiting
- Cookie security
- JWT token-based authentication
- Single device login enforcement
- Transaction verification
- Role-based access control
- CORS configuration

## 📝 API Documentation

Access the API documentation at `/api-docs` when running the server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

Mahmudul Hasan
---