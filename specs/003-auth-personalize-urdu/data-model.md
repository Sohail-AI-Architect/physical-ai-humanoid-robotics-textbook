# Data Model: Better-Auth + Personalize + Urdu Translation

**Feature**: 003-auth-personalize-urdu
**Date**: 2026-03-01

## Entity Relationship

```
User (Better-Auth managed)
 ├── Session (Better-Auth managed)
 ├── Account (Better-Auth managed)
 ├── PersonalizationCache (custom)
 └── TranslationCache (custom, shared)
```

## Tables

### user (Better-Auth auto-created + additionalFields)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | Better-Auth generated |
| name | TEXT NOT NULL | Display name |
| email | TEXT UNIQUE NOT NULL | Login identifier |
| emailVerified | BOOLEAN | Better-Auth field |
| image | TEXT | Optional avatar |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |
| softwareBackground | JSONB NOT NULL | Array of strings: ["Python", "ROS 2", ...] |
| gpuTier | TEXT NOT NULL | "RTX 4070 Ti" / "RTX 4090" / "Other" / "None" |
| ramTier | TEXT NOT NULL | "16GB" / "32GB" / "64GB+" |
| hasJetson | BOOLEAN NOT NULL | Jetson ownership |
| robotPlatform | TEXT NOT NULL | "Unitree Go2" / "Unitree G1" / "Other" / "None" |

### session (Better-Auth auto-created)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | Session ID |
| userId | TEXT FK → user.id | |
| token | TEXT UNIQUE | Session token (cookie) |
| expiresAt | TIMESTAMP | |
| ipAddress | TEXT | |
| userAgent | TEXT | |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### account (Better-Auth auto-created)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| userId | TEXT FK → user.id | |
| providerId | TEXT | "credential" for email/password |
| accountId | TEXT | |
| password | TEXT | Hashed |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### personalization_cache (custom)

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| user_id | TEXT FK → user.id | |
| chapter_slug | TEXT NOT NULL | e.g., "module-1-ros2" |
| profile_hash | TEXT NOT NULL | SHA-256 of user profile JSON (invalidate on profile change) |
| content | TEXT NOT NULL | Personalized markdown |
| created_at | TIMESTAMP DEFAULT NOW() | |
| **UNIQUE** | (user_id, chapter_slug, profile_hash) | |

### translation_cache (custom)

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| chapter_slug | TEXT UNIQUE NOT NULL | One Urdu translation per chapter |
| content_hash | TEXT NOT NULL | SHA-256 of original English content (invalidate on edit) |
| urdu_content | TEXT NOT NULL | Translated markdown |
| created_at | TIMESTAMP DEFAULT NOW() | |

## Cache Invalidation

- **Personalization**: Invalidated when `profile_hash` changes (user edits profile). Old cache entries are kept but not served.
- **Translation**: Invalidated when `content_hash` changes (chapter content updated). The `content_hash` is computed from the original English markdown at request time.
