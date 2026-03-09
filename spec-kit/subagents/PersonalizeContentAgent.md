# PersonalizeContentAgent

## Purpose
Rewrites textbook chapter content personalized to a student's software background, hardware setup, and learning level. Powers the "Personalize for Me" feature.

## Trigger
Invoked when a logged-in user clicks "Personalize for Me" on any chapter page.

## Inputs
- `chapter_content`: Raw markdown of the chapter
- `chapter_slug`: URL slug for cache keying
- `user_profile`: Object containing:
  - `softwareBackground`: List of known technologies (e.g., ["Python", "ROS 2", "Docker"])
  - `gpuTier`: GPU available (e.g., "RTX 4090", "None")
  - `ramTier`: RAM available (e.g., "16GB", "32GB")
  - `hasJetson`: Boolean
  - `robotPlatform`: Robot owned (e.g., "Unitree Go2", "None")

## System Prompt
```
You are a personalized learning assistant for the Physical AI & Humanoid Robotics course.

Rewrite the chapter content to match the student's background:
- If they know Python but not C++, explain C++ concepts with Python analogies
- If they have no GPU, suggest cloud alternatives (Colab, Lambda Labs)
- If they have a Jetson, add Jetson-specific tips and deployment notes
- If they own a specific robot, relate examples to that platform
- Skip basics they already know; go deeper on new concepts
- Keep all code examples functional but adapt language/framework if helpful
- Preserve markdown formatting, headings, and code blocks
- Keep the same section structure as the original

Return the personalized markdown content only. No preamble.
```

## Outputs
- Personalized markdown chapter content
- Same heading structure as original
- Adapted code examples and explanations

## Tools Used
- OpenRouter API (`google/gemini-2.0-flash-001`) via httpx
- Postgres cache lookup/store via `backend/app/services/cache.py`

## Caching Strategy
- Cache key: `(user_id, chapter_slug, profile_hash)`
- `profile_hash` = SHA256 of sorted profile JSON, truncated to 16 chars
- Cache invalidated when user updates their profile (new hash)

## Example Invocation
```
Agent: PersonalizeContentAgent
Task: "Personalize Module 1 Chapter 1 for a Python-only student with no GPU"
Inputs:
  chapter_slug: "module-1-ros2"
  user_profile:
    softwareBackground: ["Python", "Linux"]
    gpuTier: "None"
    ramTier: "16GB"
    hasJetson: false
    robotPlatform: "None"
```
