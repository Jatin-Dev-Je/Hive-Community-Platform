# Community Platform Backend

A lightweight community platform with discussion threads, milestone sharing, Q&A features, and mentorship capabilities.

## Features

- **User Authentication & Authorization** - JWT-based with Redis blacklist
- **Discussion Threads** - Multiple categories and types
- **Posts & Replies** - Nested discussions with engagement features
- **Milestone Sharing** - Users can share achievements
- **Q&A System** - Questions and answers with acceptance
- **Mentorship** - Connect mentors and mentees
- **Rate Limiting** - Redis-based distributed rate limiting
- **API Documentation** - Complete Swagger/OpenAPI documentation

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Redis** for caching, rate limiting, and JWT blacklist
- **JWT** for authentication
- **Swagger** for API documentation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6.0 or higher)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/community_platform

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRE=30d

   # Password Hashing
   BCRYPT_SALT_ROUNDS=12

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   ```

4. **Generate JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and replace `your_jwt_secret_key_here_change_in_production` in your `.env` file.

5. **Start MongoDB and Redis**
   ```bash
   # Start MongoDB (if using local installation)
   mongod

   # Start Redis (if using local installation)
   redis-server
   ```

6. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search` - Search users
- `GET /api/users/mentors` - Get all mentors
- `GET /api/users/mentees` - Get users seeking mentorship
- `PUT /api/users/:id/reputation` - Update user reputation
- `GET /api/users/:id/stats` - Get user statistics

### Threads
- `GET /api/threads` - Get all threads
- `GET /api/threads/:id` - Get thread by ID
- `POST /api/threads` - Create new thread
- `PUT /api/threads/:id` - Update thread
- `DELETE /api/threads/:id` - Delete thread
- `GET /api/threads/category/:category` - Get threads by category
- `GET /api/threads/featured` - Get featured threads
- `GET /api/threads/search` - Search threads

### Posts
- `GET /api/posts/thread/:threadId` - Get posts in thread
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/dislike` - Dislike/undislike post
- `POST /api/posts/:id/accept` - Accept answer (Q&A)

### Replies
- `GET /api/replies/post/:postId` - Get replies for post
- `GET /api/replies/:id` - Get reply by ID
- `POST /api/replies` - Create new reply
- `PUT /api/replies/:id` - Update reply
- `DELETE /api/replies/:id` - Delete reply
- `POST /api/replies/:id/like` - Like/unlike reply
- `POST /api/replies/:id/dislike` - Dislike/undislike reply
- `POST /api/replies/:id/helpful` - Mark reply as helpful
- `POST /api/replies/:id/unhelpful` - Unmark reply as helpful

## Rate Limiting

The API uses Redis-based rate limiting with different limits for different endpoints:

- **Auth endpoints**: 5 attempts per 15 minutes
- **General API**: 100 requests per minute
- **Post creation**: 10 posts per minute
- **Search**: 30 searches per minute
- **File uploads**: 5 uploads per minute

## JWT Blacklist

JWT tokens are automatically blacklisted on logout and checked on each authenticated request. This ensures that logged-out tokens cannot be used.

## Development

### Project Structure
```
community-backend/
├── controllers/          # Business logic
├── models/              # Mongoose schemas
├── routes/              # API routes with Swagger docs
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── config/              # Configuration files
├── app.js               # Express app setup
├── server.js            # Server entry point
└── package.json
```

### Adding New Features

1. **Create Model** - Add schema in `models/`
2. **Create Controller** - Add business logic in `controllers/`
3. **Create Routes** - Add endpoints in `routes/` with Swagger docs
4. **Update app.js** - Mount new routes

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure MongoDB and Redis for production
4. Set up proper logging and monitoring
5. Use HTTPS
6. Configure CORS properly
7. Set up backup strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 