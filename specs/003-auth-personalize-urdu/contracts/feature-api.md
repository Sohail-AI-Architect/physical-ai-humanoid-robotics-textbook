# Feature API Contracts (FastAPI Backend — Port 8000)

These endpoints extend the existing FastAPI backend. They require a valid Better-Auth session token.

## Auth Middleware

All protected endpoints require the `Authorization: Bearer <session_token>` header. FastAPI middleware validates the token by querying the `session` table in Neon Postgres. Returns 401 if invalid/expired.

---

## POST /api/personalize

**Description**: Personalize chapter content for the authenticated user's background.

**Headers**: `Authorization: Bearer <session_token>`

**Request**:
```json
{
  "chapter_slug": "module-1-ros2",
  "chapter_content": "# Module 1: ROS 2 Foundations\n\n..."
}
```

**Response 200**:
```json
{
  "personalized_content": "# Module 1: ROS 2 Foundations\n\n(Rewritten for your background)...",
  "cached": false
}
```

**Response 200 (cache hit)**:
```json
{
  "personalized_content": "...",
  "cached": true
}
```

**Error 401**: Unauthorized.
**Error 503**: AI model unavailable → `"Service temporarily unavailable. Please try again in a moment."`

---

## POST /api/translate

**Description**: Translate chapter content to Urdu.

**Headers**: `Authorization: Bearer <session_token>`

**Request**:
```json
{
  "chapter_slug": "module-1-ros2",
  "chapter_content": "# Module 1: ROS 2 Foundations\n\n..."
}
```

**Response 200**:
```json
{
  "urdu_content": "# ماڈیول 1: ROS 2 بنیادیں\n\n...",
  "cached": false
}
```

**Error 401**: Unauthorized.
**Error 503**: AI model unavailable.

---

## GET /api/profile

**Description**: Get the authenticated user's profile.

**Headers**: `Authorization: Bearer <session_token>`

**Response 200**:
```json
{
  "id": "abc123",
  "name": "Sohail Ahmed",
  "email": "sohail@example.com",
  "softwareBackground": ["Python", "ROS 2", "Docker"],
  "gpuTier": "RTX 4090",
  "ramTier": "32GB",
  "hasJetson": true,
  "robotPlatform": "Unitree Go2"
}
```

---

## PUT /api/profile

**Description**: Update the authenticated user's background profile.

**Headers**: `Authorization: Bearer <session_token>`

**Request**:
```json
{
  "softwareBackground": ["Python", "ROS 2", "Docker", "CUDA"],
  "gpuTier": "RTX 4090",
  "ramTier": "64GB+",
  "hasJetson": true,
  "robotPlatform": "Unitree G1"
}
```

**Response 200**: Updated profile object.
**Error 422**: Invalid field values.
