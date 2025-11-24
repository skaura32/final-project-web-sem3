# Bow Course Registration System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Admin endpoints require authentication. Use admin login to get access.

## Admin Credentials (Development)
- Username: `admin`
- Password: `admin123`

## Error Handling
All endpoints return JSON responses with the following structure:

### Success Response
```json
{
    "success": true,
    "data": {...}
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error message here"
}
```

## Admin Features Summary

### ✅ 1. Admin Login
- **Endpoint:** POST `/api/admin/login`
- **Access:** Public
- **Purpose:** Authenticate admin users

### ✅ 2. Create Course
- **Endpoint:** POST `/api/courses`
- **Access:** Admin Only
- **Purpose:** Add new courses to the system

### ✅ 3. Edit Course
- **Endpoint:** PUT `/api/courses/:id`
- **Access:** Admin Only
- **Purpose:** Update existing course details

### ✅ 4. Delete Course
- **Endpoint:** DELETE `/api/courses/:id`
- **Access:** Admin Only
- **Purpose:** Remove courses from system

### ✅ 5. Search Course
- **Endpoint:** GET `/api/courses?search=keyword`
- **Access:** Public
- **Purpose:** Find courses by code or name

### ✅ 6. View Registered Students
- **Endpoint:** GET `/api/admin/students`
- **Access:** Admin Only
- **Purpose:** See all registered students

### ✅ 7. View Student Contact Messages
- **Endpoint:** GET `/api/messages`
- **Access:** Admin Only
- **Purpose:** Read student inquiries and messages

## Rate Limiting
Currently no rate limiting implemented (recommended for production)

## Security Notes
- All passwords are hashed using bcrypt
- Database credentials stored in `.env` file (not in version control)
- CORS enabled for frontend integration

## Development Setup
1. Install dependencies: `npm install`
2. Configure `.env` file with database credentials
3. Run database schema: `schema.sql`
4. Start server: `node server.js`

## Production Considerations
- Implement JWT authentication
- Add rate limiting
- Enable HTTPS
- Use environment-specific configurations
- Add input validation middleware
- Implement logging system