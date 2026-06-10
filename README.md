# Employee Leave Portal Backend

start docker : sudo service docker start
cd /mnt/c/shivani/microservice_assignment/employee-leave-portal-backend
docker compose up --build 


A microservices-based employee leave management system with authentication, role-based authorization, and comprehensive leave request workflows.

## Features

✅ User Registration & Login  
✅ JWT Authentication  
✅ Role-based Authorization (Employee/Manager)  
✅ Auto Leave Balance Initialization  
✅ Leave Balance Management  
✅ Apply Leave with Validations  
✅ Past Date Validation  
✅ Date Range Validation  
✅ Overlapping Leave Detection  
✅ Leave Balance Validation  
✅ Manager Leave Review & Approval  
✅ Leave Rejection with Reason  
✅ Leave History & Filtering  
✅ Request/Response Logging  

## Architecture

```
┌─────────────────────────────────────────────────────┐
│             API Gateway (Port 3000)                 │
│    Routes requests to auth-service & leave-service  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐    ┌──────▼──────────┐
│ Auth Service   │    │ Leave Service   │
│  (Port 3001)   │    │  (Port 3002)    │
│ • Register     │    │ • Leave Balance │
│ • Login        │    │ • Apply Leave   │
│ • JWT Token    │    │ • Manage Leave  │
└───────┬────────┘    └──────┬──────────┘
        │                     │
        └──────────┬──────────┘
                   │
            ┌──────▼──────────┐
            │    MongoDB      │
            │   (Port 27017)  │
            │ leave-management│
            └─────────────────┘
```

## Tech Stack

- **Node.js + Express** — REST API framework
- **MongoDB** — Database
- **Mongoose** — MongoDB ODM
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Docker & Docker Compose** — Containerization & orchestration
- **Nodemon** — Development server reload

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running
- Docker & Docker Compose (optional)

### Local Development

1. **Clone & Install**
   ```bash
   cd employee-leave-portal-backend
   npm install
   # Repeat in each service folder (auth-service, leave-service, api-gateway)
   ```

2. **Setup Environment**
   Create `.env` files in each service:
   
   **auth-service/.env**
   ```
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/leave-management
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=1d
   ```

   **leave-service/.env**
   ```
   PORT=3002
   MONGO_URI=mongodb://localhost:27017/leave-management
   ```

   **api-gateway/.env**
   ```
   PORT=3000
   ```

3. **Start Services** (in separate terminals)
   ```bash
   # Terminal 1: Auth Service
   cd auth-service
   npm run dev

   # Terminal 2: Leave Service
   cd leave-service
   npm run dev

   # Terminal 3: API Gateway
   cd api-gateway
   npm run dev
   ```

4. **API is ready** at `http://localhost:3000`

### Docker Compose

1. **Build & Run**
   ```bash
   docker compose up --build
   ```

2. **Stop Services**
   ```bash
   docker compose down
   ```

3. **View Logs**
   ```bash
   docker compose logs -f
   ```

## API Documentation

Full API documentation available in [docs/api-documentation.md](docs/api-documentation.md)

### Quick API Examples

**Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "EMPLOYEE"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Apply Leave**
```bash
curl -X POST http://localhost:3000/api/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "startDate": "2026-06-15",
    "endDate": "2026-06-17",
    "leaveType": "CASUAL",
    "numberOfDays": 3
  }'
```

## Project Structure

```
employee-leave-portal-backend/
├── api-gateway/              # Request routing layer
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── auth-service/             # Authentication & user management
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── Dockerfile
│   └── package.json
├── leave-service/            # Leave management
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── api-documentation.md
│   ├── architecture.md
│   └── assumptions.md
├── docker-compose.yml
└── README.md
```

## Logging

All services include comprehensive logging:
- **Request logs**: Method, URL, timestamp
- **Response logs**: Status code, operation type
- **Success logs**: What was created/updated with IDs
- **Error logs**: Detailed error messages with context

Example console output:
```
AUTH SERVICE HIT: POST /api/auth/register
register: email=john@example.com, role=EMPLOYEE
calling leave-service init for userId=607f1f77bcf86cd799439011
register success: userId=607f1f77bcf86cd799439011, email=john@example.com
AUTH SERVICE RESPONSE: POST /api/auth/register -> 201
```

## Error Handling

All services return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- `400` — Bad Request (validation errors, duplicate email, etc.)
- `401` — Unauthorized (invalid token, missing credentials)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found (resource doesn't exist)
- `500` — Server Error

## Environment Variables

### Auth Service
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Service port |
| MONGO_URI | - | MongoDB connection string |
| JWT_SECRET | - | Secret key for JWT signing |
| JWT_EXPIRES_IN | 1d | Token expiration time |

### Leave Service
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3002 | Service port |
| MONGO_URI | - | MongoDB connection string |

### API Gateway
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Gateway port |

## Development Notes

- JWT tokens expire after 1 day by default; refresh mechanism not yet implemented
- Leave balance auto-initializes on user registration (CASUAL: 12, SICK: 10, PRIVILEGE: 15)
- Managers can only approve/reject leaves assigned to them
- Past date validation prevents applying leave for dates before today

## Contributing

1. Create a feature branch
2. Make changes with meaningful commits
3. Ensure all tests pass
4. Submit PR with description

## License

MIT