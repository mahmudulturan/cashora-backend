# MERN Backend Boilerplate

A robust and scalable backend boilerplate built with TypeScript, Express.js, and MongoDB. This project provides a solid foundation for building production-ready REST APIs with modern best practices.

## 🚀 Features

- **TypeScript Support**: Full TypeScript implementation for better type safety and developer experience
- **Authentication & Authorization**: JWT-based auth system with cookie support
- **Rate Limiting**: Built-in API rate limiting protection
- **Email Service**: Preconfigured Nodemailer setup for email handling
- **API Documentation**: Swagger/OpenAPI integration for API documentation
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Request validation using Zod
- **Logging**: Winston logger implementation for better debugging
- **View Engine**: Pug templating engine for server-side rendering
- **Database**: MongoDB with Mongoose ODM

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

### System Requirements

- **Node.js**: Download and install from [Node.js official website](https://nodejs.org/)
- **MongoDB**: 
  - Install locally from [MongoDB official website](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas cloud service
- **TypeScript**: Install globally using `npm install -g typescript`

### Development Tools (Recommended)

- VS Code or any TypeScript-supported IDE
- MongoDB Compass for database management
- Postman or Insomnia for API testing

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/mahmudulturan/mern-backend-boilerplate.git
cd mern-backend-boilerplate
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

## 🛡️ Security Features

- CORS configuration
- Rate limiting
- JWT authentication
- Request validation
- Error handling
- Cookie security

## 📝 API Documentation

Access the API documentation at `/api-docs` when running the server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Mahmudul Hasan
---

Feel free to star ⭐ this repository if you find it helpful!

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
