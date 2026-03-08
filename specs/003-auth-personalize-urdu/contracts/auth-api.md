# Auth API Contracts (Better-Auth Server — Port 3001)

These endpoints are served by the Better-Auth Node.js server. The Docusaurus frontend calls them directly.

## POST /api/auth/sign-up/email

**Description**: Register a new user with email/password + background profile.

**Request**:
```json
{
  "name": "Sohail Ahmed",
  "email": "sohail@example.com",
  "password": "securepass123",
  "softwareBackground": ["Python", "ROS 2", "Docker"],
  "gpuTier": "RTX 4090",
  "ramTier": "32GB",
  "hasJetson": true,
  "robotPlatform": "Unitree Go2"
}
```

**Response 200**:
```json
{
  "user": {
    "id": "abc123",
    "name": "Sohail Ahmed",
    "email": "sohail@example.com",
    "softwareBackground": ["Python", "ROS 2", "Docker"],
    "gpuTier": "RTX 4090",
    "ramTier": "32GB",
    "hasJetson": true,
    "robotPlatform": "Unitree Go2"
  },
  "session": { "id": "sess_xyz", "token": "..." }
}
```

**Error 422**: Missing required fields.
**Error 409**: Email already exists → `"An account with this email already exists."`

## POST /api/auth/sign-in/email

**Request**:
```json
{
  "email": "sohail@example.com",
  "password": "securepass123"
}
```

**Response 200**: Same shape as sign-up response (user + session).
**Error 401**: `"Invalid email or password."`

## POST /api/auth/sign-out

**Headers**: `Cookie: better-auth.session_token=...`

**Response 200**: `{ "success": true }`

## GET /api/auth/get-session

**Headers**: `Cookie: better-auth.session_token=...`

**Response 200**:
```json
{
  "user": { "id": "abc123", "name": "Sohail Ahmed", "email": "...", ... },
  "session": { "id": "sess_xyz", "expiresAt": "..." }
}
```

**Response 401**: No valid session.
