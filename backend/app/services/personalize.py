import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()

OPENROUTER_BASE = "https://openrouter.ai/api/v1"

LLM_ALIASES = {
    "google/gemini-flash-1.5": "google/gemini-2.0-flash-001",
}


def _build_personalization_prompt(user: dict, chapter_content: str) -> str:
    sw = user.get("softwareBackground", "[]")
    if isinstance(sw, str):
        try:
            sw = json.loads(sw)
        except (json.JSONDecodeError, TypeError):
            sw = []

    gpu = user.get("gpuTier", "None")
    ram = user.get("ramTier", "16GB")
    jetson = user.get("hasJetson", False)
    robot = user.get("robotPlatform", "None")

    return f"""You are an expert AI tutor personalizing course content.

STUDENT PROFILE:
- Software skills: {', '.join(sw) if sw else 'Beginner (no listed skills)'}
- GPU: {gpu}
- RAM: {ram}
- Has Jetson: {'Yes' if jetson else 'No'}
- Robot Platform: {robot}

TASK: Rewrite the following chapter content tailored to this student's background.
- If they lack certain skills (e.g., no CUDA experience), explain GPU concepts from scratch.
- If they have advanced skills, skip basics and go deeper.
- Reference their specific hardware when giving examples.
- Keep all technical terms, code blocks, and markdown formatting.
- Keep the same overall structure (headings, sections).
- Write in the same language as the original (English).

CHAPTER CONTENT:
{chapter_content}

Return ONLY the rewritten markdown content. No preamble or explanation."""


async def personalize_chapter(user: dict, chapter_content: str) -> str:
    raw_model = os.getenv("LLM_MODEL", "google/gemini-2.0-flash-001")
    model = LLM_ALIASES.get(raw_model, raw_model)
    api_key = os.getenv("OPENROUTER_API_KEY")

    prompt = _build_personalization_prompt(user, chapter_content)

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 4096,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
