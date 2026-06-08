# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained via the `/auth/login` endpoint.

---

## Authentication Service (`/api/auth`)

### 1. Register User
**POST** `/auth/register`

Create a new user account and auto-initialize leave balance.

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "EMPLOYEE",
  "managerId": "607f1f77bcf86cd799439012" // Optional, for EMPLOYEE role
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "managerId": null,
    "createdAt": "2026-06-08T10:30:00Z",
    "updatedAt": "2026-06-08T10:30:00Z"
  }
}
```

**Error Response (400/500)**
```json
{
  "success": false,
  "message": "E11000 duplicate key error collection: leave-management.users index: email_1 dup key: { email: \"john@example.com\" }"
}
```

**Logs**
```
register: email=john@example.com, role=EMPLOYEE
calling leave-service init for userId=607f1f77bcf86cd799439011
register success: userId=607f1f77bcf86cd799439011, email=john@example.com
```

---

### 2. Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJyb2xlIjoiRU1QTE9ZRUUiLCJpYXQiOjE3MTcyNjQyMDAsImV4cCI6MTcxNzM1MDYwMH0.abc123xyz"
}
```

**Error Response (401)**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Logs**
```
login attempt: email=john@example.com
login success: userId=607f1f77bcf86cd799439011, email=john@example.com
```

---

### 3. Get Profile
**GET** `/auth/profile`

Retrieve authenticated user profile.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**
```json
{
  "success": true,
  "user": {
    "userId": "607f1f77bcf86cd799439011",
    "role": "EMPLOYEE"
  }
}
```

**Logs**
```
profile: userId=607f1f77bcf86cd799439011
profile returned: userId=607f1f77bcf86cd799439011
```

---

## Leave Service (`/api/leave`)

### 1. Get Leave Balance
**GET** `/leave`

View current leave balance for authenticated user.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**
```json
{
  "_id": "607f1f77bcf86cd799439015",
  "employeeId": "607f1f77bcf86cd799439011",
  "casualLeave": 10,
  "sickLeave": 8,
  "privilegeLeave": 12,
  "createdAt": "2026-06-08T10:30:30Z",
  "updatedAt": "2026-06-08T11:45:00Z"
}
```

**Error Response (404)**
```json
{
  "message": "Leave balance not found"
}
```

**Logs**
```
getLeaveBalance: userId=607f1f77bcf86cd799439011
getLeaveBalance success: userId=607f1f77bcf86cd799439011
```

---

### 2. Apply for Leave
**POST** `/leave/apply`

Submit a new leave request.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**
```json
{
  "startDate": "2026-06-15",
  "endDate": "2026-06-17",
  "leaveType": "CASUAL",
  "numberOfDays": 3
}
```

**Response (201 Created)**
```json
{
  "_id": "607f1f77bcf86cd799439020",
  "employeeId": "607f1f77bcf86cd799439011",
  "startDate": "2026-06-15",
  "endDate": "2026-06-17",
  "leaveType": "CASUAL",
  "numberOfDays": 3,
  "status": "PENDING",
  "createdAt": "2026-06-08T12:00:00Z",
  "updatedAt": "2026-06-08T12:00:00Z"
}
```

**Validation Errors (400)**

*Past Date*
```json
{
  "message": "Cannot apply leave for past dates"
}
```

*Invalid Date Range*
```json
{
  "message": "Start date cannot be after end date"
}
```

*Overlapping Leave*
```json
{
  "message": "Overlapping leave request exists"
}
```

*Insufficient Balance*
```json
{
  "message": "Insufficient casual leave balance"
}
```

**Logs**
```
applyLeave: userId=607f1f77bcf86cd799439011, leaveType=CASUAL, start=2026-06-15, end=2026-06-17, days=3
applyLeave success: userId=607f1f77bcf86cd799439011 leaveId=607f1f77bcf86cd799439020
```

---

### 3. Get Leave History
**GET** `/leave/history?status=APPROVED&page=1&limit=10`

Retrieve leave request history with optional filters.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status (PENDING/APPROVED/REJECTED) |
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Records per page |

**Response (200 OK)**
```json
{
  "total": 5,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "_id": "607f1f77bcf86cd799439020",
      "employeeId": "607f1f77bcf86cd799439011",
      "startDate": "2026-06-15",
      "endDate": "2026-06-17",
      "leaveType": "CASUAL",
      "numberOfDays": 3,
      "status": "APPROVED",
      "createdAt": "2026-06-08T12:00:00Z"
    }
  ]
}
```

**Logs**
```
getLeaveHistory: userId=607f1f77bcf86cd799439011, query={"status":"APPROVED","page":"1","limit":"10"}
getLeaveHistory success: userId=607f1f77bcf86cd799439011 returned=1
```

---

### 4. Get Pending Leaves (Manager)
**GET** `/leave/pending`

Retrieve all pending leave requests for manager review.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Requirements**
- User role must be `MANAGER`

**Response (200 OK)**
```json
[
  {
    "_id": "607f1f77bcf86cd799439020",
    "employeeId": "607f1f77bcf86cd799439011",
    "startDate": "2026-06-15",
    "endDate": "2026-06-17",
    "leaveType": "CASUAL",
    "numberOfDays": 3,
    "status": "PENDING",
    "createdAt": "2026-06-08T12:00:00Z"
  }
]
```

**Error Response (403)**
```json
{
  "message": "Access denied"
}
```

**Logs**
```
getPendingLeaves: userId=607f1f77bcf86cd799439012, role=MANAGER
getPendingLeaves success: managerId=607f1f77bcf86cd799439012 returned=1
```

---

### 5. Approve Leave (Manager)
**PUT** `/leave/:id/approve`

Approve a pending leave request and deduct from balance.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Response (200 OK)**
```json
{
  "message": "Leave approved",
  "leave": {
    "_id": "607f1f77bcf86cd799439020",
    "employeeId": "607f1f77bcf86cd799439011",
    "status": "APPROVED",
    "startDate": "2026-06-15",
    "endDate": "2026-06-17",
    "leaveType": "CASUAL",
    "numberOfDays": 3
  }
}
```

**Error Responses**

*Not Manager (403)*
```json
{
  "message": "Access denied"
}
```

*Leave Not Found (404)*
```json
{
  "message": "Leave request not found"
}
```

**Logs**
```
approveLeave: userId=607f1f77bcf86cd799439012, role=MANAGER, leaveId=607f1f77bcf86cd799439020
approveLeave success: managerId=607f1f77bcf86cd799439012 leaveId=607f1f77bcf86cd799439020
```

---

### 6. Reject Leave (Manager)
**PUT** `/leave/:id/reject`

Reject a pending leave request with reason.

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Request Body**
```json
{
  "rejectionReason": "Project deadline conflict"
}
```

**Response (200 OK)**
```json
{
  "message": "Leave rejected",
  "leave": {
    "_id": "607f1f77bcf86cd799439020",
    "employeeId": "607f1f77bcf86cd799439011",
    "status": "REJECTED",
    "rejectionReason": "Project deadline conflict",
    "startDate": "2026-06-15",
    "endDate": "2026-06-17"
  }
}
```

**Error Responses**

*Not Manager (403)*
```json
{
  "message": "Access denied"
}
```

*Leave Not Found (404)*
```json
{
  "message": "Leave request not found"
}
```

**Logs**
```
rejectLeave: userId=607f1f77bcf86cd799439012, role=MANAGER, leaveId=607f1f77bcf86cd799439020
Notification: Leave rejected for employee 607f1f77bcf86cd799439011
rejectLeave success: managerId=607f1f77bcf86cd799439012 leaveId=607f1f77bcf86cd799439020
```

---

## Error Handling

All endpoints follow consistent error handling with proper HTTP status codes and descriptive messages.

### Authentication Errors

**Missing/Invalid Token (401)**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Missing Authorization Header (401)**
```json
{
  "success": false,
  "message": "Token missing"
}
```

### Authorization Errors

**Insufficient Permission (403)**
```json
{
  "message": "Access denied"
}
```

### Server Errors (500)

```json
{
  "success": false,
  "message": "MongoDB Error: Connection refused"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## Leave Types

- `CASUAL` — Casual leaves (12 days/year)
- `SICK` — Sick leaves (10 days/year)
- `PRIVILEGE` — Privilege leaves (15 days/year)

## Leave Status

- `PENDING` — Awaiting manager approval
- `APPROVED` — Approved by manager
- `REJECTED` — Rejected by manager

---

## Rate Limiting

Not currently implemented. To be added in future versions.

## Pagination

Endpoints supporting pagination use:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
