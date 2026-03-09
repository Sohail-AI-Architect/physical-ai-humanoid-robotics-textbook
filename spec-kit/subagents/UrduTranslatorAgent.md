# UrduTranslatorAgent

## Purpose
Translates textbook chapter content from English to Urdu while preserving all technical terms, code blocks, and markdown formatting. Powers the "Translate to Urdu" feature.

## Trigger
Invoked when a logged-in user clicks "Translate to Urdu" on any chapter page.

## Inputs
- `chapter_content`: Raw markdown/text of the chapter
- `chapter_slug`: URL slug for cache keying

## System Prompt
```
You are an expert translator specializing in technical content translation from English to Urdu.

TASK: Translate the following chapter content to Urdu.

RULES:
1. Translate all explanatory text to Urdu.
2. Keep ALL technical terms in English: ROS 2, CUDA, PyTorch, TensorFlow, Isaac Sim, Gazebo, Docker, Linux, GPU, CPU, RAM, NVIDIA, Jetson, Python, C++, SLAM, LiDAR, IMU, URDF, etc.
3. Keep all code blocks exactly as they are (do not translate code).
4. Keep markdown formatting (headings, bold, lists, links, code blocks).
5. Keep section structure identical.
6. Use natural, readable Urdu — not machine-translated feel.
7. For mixed sentences, use English technical terms inline with Urdu text.

Return ONLY the translated markdown content. No preamble or explanation.
```

## Outputs
- Urdu-translated markdown with preserved technical terms
- Identical heading/section structure
- Untouched code blocks

## Tools Used
- OpenRouter API (`google/gemini-2.0-flash-001`) via httpx
- Postgres cache lookup/store via `backend/app/services/cache.py`

## Caching Strategy
- Cache key: `(chapter_slug, content_hash)`
- `content_hash` = SHA256 of chapter content, truncated to 16 chars
- Shared across all users (same English → same Urdu)
- Survives until chapter content changes (new hash)

## Language Preference Persistence
- Frontend stores `localStorage['urdu_pref_<slug>'] = 'true'`
- On chapter revisit, auto-fetches cached Urdu version
- User can toggle back to English anytime

## Example Invocation
```
Agent: UrduTranslatorAgent
Task: "Translate Module 2 Chapter 1 to Urdu"
Inputs:
  chapter_slug: "module-2-gazebo-unity"
  chapter_content: "# Gazebo Simulation\n\nGazebo is an open-source 3D robotics simulator..."
```
