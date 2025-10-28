# Musa HR Management Backend

Express.js backend API for the Musa HR Management System with Prisma ORM and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/musa_project_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   CLIENT_URL="http://localhost:8081"
   ```

3. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

4. **Set up database**
   ```bash
   npm run prisma:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── utils/           # Utility functions
└── index.ts         # Main server file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Departments
- `GET /api/departments` - Get all departments

### Health Check
- `GET /health` - Server health status

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `PORT` | Server port | `3000` |
| `CLIENT_URL` | React Native client URL | `http://localhost:8081` |
| `NODE_ENV` | Environment mode | `development` |

### Database Schema

The backend uses Prisma with PostgreSQL. The schema includes:

- **Users** - Authentication and user management
- **Employees** - Employee profiles and information
- **Departments** - Organizational departments
- **Attendance** - Time tracking and attendance
- **Leaves** - Leave management system
- **Performance** - Performance reviews and KPIs

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Input validation** - Request validation middleware

## 📱 React Native Integration

The backend is designed to work with the React Native frontend:

1. **CORS** configured for React Native development
2. **JWT tokens** for stateless authentication
3. **RESTful API** design
4. **Error handling** with consistent response format

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Prisma client errors**
   - Run `npm run prisma:generate`
   - Check schema syntax

3. **CORS errors**
   - Update `CLIENT_URL` in `.env`
   - Check React Native development server URL

## 📝 API Documentation

### Request/Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Validation errors"]
}
```

### Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
