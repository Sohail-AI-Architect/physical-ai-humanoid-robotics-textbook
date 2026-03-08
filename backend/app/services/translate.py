import os
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()

OPENROUTER_BASE = "https://openrouter.ai/api/v1"

LLM_ALIASES = {
    "google/gemini-flash-1.5": "google/gemini-2.0-flash-001",
}

TRANSLATION_PROMPT = """You are an expert translator specializing in technical content translation from English to Urdu.

TASK: Translate the following chapter content (provided as HTML) to Urdu.

RULES:
1. Translate all explanatory text to Urdu.
2. Keep ALL technical terms in English: ROS 2, CUDA, PyTorch, TensorFlow, Isaac Sim, Gazebo, Docker, Linux, GPU, CPU, RAM, NVIDIA, Jetson, Python, C++, SLAM, LiDAR, IMU, URDF, etc.
3. Keep ALL code blocks (<pre>, <code> elements) EXACTLY as they are — do not translate any code.
4. Keep ALL HTML tags and structure intact. Only translate the visible text content between tags.
5. Keep section structure identical.
6. Use natural, readable Urdu — not machine-translated feel.
7. For mixed sentences, use English technical terms inline with Urdu text.
8. Add dir="rtl" attribute to the outermost wrapper element for proper Urdu text direction.

CHAPTER CONTENT (HTML):
{content}

Return ONLY the translated HTML content. No preamble, no explanation, no markdown fences."""


async def translate_to_urdu(chapter_content: str) -> str:
    raw_model = os.getenv("LLM_MODEL", "google/gemini-2.0-flash-001")
    model = LLM_ALIASES.get(raw_model, raw_model)
    api_key = os.getenv("OPENROUTER_API_KEY")

    prompt = TRANSLATION_PROMPT.format(content=chapter_content)

    async with httpx.AsyncClient(timeout=90.0) as client:
        resp = await client.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 8192,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
