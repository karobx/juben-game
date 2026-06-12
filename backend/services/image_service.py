"""Generate and cache AI historical scene illustrations."""

from __future__ import annotations

import hashlib
import json
import os
import re
import ssl
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Literal

try:
    import certifi
except ImportError:  # pragma: no cover
    certifi = None

from services.scene_image_prompts import composition_hints_for_narrative, normalize_scene_narrative

ProviderName = Literal["openai", "pollinations", "cache"]

ILLUSTRATIONS_DIR = Path(os.getenv("ILLUSTRATIONS_DIR", "illustrations"))
SCENES_DIR = ILLUSTRATIONS_DIR / "scenes"
IMAGE_PROVIDER = os.getenv("IMAGE_PROVIDER", "auto").strip().lower()
OPENAI_IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "dall-e-3")
POLLINATIONS_MODEL = os.getenv("POLLINATIONS_MODEL", "zimage")
IMAGE_WIDTH = int(os.getenv("IMAGE_WIDTH", "1024"))
IMAGE_HEIGHT = int(os.getenv("IMAGE_HEIGHT", "576"))

_STYLE_SUFFIX = (
    "traditional Chinese historical scroll painting, ink wash with muted earth tones, "
    "accurate ancient China architecture and costumes, cinematic wide composition, "
    "museum quality, no text, no watermark, no modern objects"
)

_PROVIDER_SETUP_HINT = (
    "請在 .env 設定 OPENAI_API_KEY 或 POLLINATIONS_API_KEY。"
    "Pollinations 金鑰可於 https://enter.pollinations.ai 取得。"
)

_SECRET_PATTERNS = (
    re.compile(r"sk_[A-Za-z0-9_\-]+"),
    re.compile(r"Bearer\s+\S+", re.IGNORECASE),
)


def _env_secret(name: str) -> str:
    return os.getenv(name, "").strip()


def _redact_secrets(text: str) -> str:
    redacted = text
    for pattern in _SECRET_PATTERNS:
        redacted = pattern.sub("[REDACTED]", redacted)
    return redacted


def _ensure_dir() -> Path:
    ILLUSTRATIONS_DIR.mkdir(parents=True, exist_ok=True)
    return ILLUSTRATIONS_DIR


_INTERIOR_COURT_RE = re.compile(r"咸陽宮|殿上|宮中|正殿|廷議|朝堂|朝廷|奉天殿")
_MISLEADING_PERIOD_RE = re.compile(r"場景：西域、|西域、咸陽")


def _is_interior_court_scene(text: str) -> bool:
    return bool(_INTERIOR_COURT_RE.search(text))


def build_generation_prompt(narrative: str = "", image_prompt: dict[str, Any] | None = None) -> str:
    """Compose an English+Chinese friendly prompt for image models."""
    prompt_data = image_prompt or {}
    narrative_text = narrative.replace("\n", " ").strip()
    prompt_text = (
        prompt_data.get("expandedPrompt") or prompt_data.get("prompt") or ""
    ).replace("\n", " ").strip()

    # 玩家敘事優先；避免 period 級「西域、咸陽」蓋過殿上內景
    if narrative_text:
        scene_text = narrative_text
        if _is_interior_court_scene(narrative_text):
            prompt_text = _MISLEADING_PERIOD_RE.sub("", prompt_text)
    else:
        scene_text = prompt_text

    if not scene_text and prompt_text:
        scene_text = prompt_text

    mood = prompt_data.get("moodKeywords") or []
    mood_text = "、".join(str(keyword) for keyword in mood[:4] if keyword)

    parts = [scene_text]
    if mood_text:
        parts.append(f"氛圍：{mood_text}")
    route = str(prompt_data.get("route") or "mainline")
    narrative_for_hints = narrative_text or scene_text
    for hint in composition_hints_for_narrative(
        normalize_scene_narrative(narrative_for_hints),
        route=route,
    ):
        parts.append(hint)
    parts.append(_STYLE_SUFFIX)
    return "。".join(part for part in parts if part)


def _cache_key(generation_prompt: str, provider: ProviderName) -> str:
    digest = hashlib.sha256(f"{provider}:{generation_prompt}".encode("utf-8")).hexdigest()
    return digest[:24]


def _cached_path(illustration_id: str) -> Path:
    return _ensure_dir() / f"{illustration_id}.png"


def illustration_scene_key(period_id: str | None, scene_id: str) -> str:
    """Namespace scene illustrations by period to avoid cross-era file collisions."""
    cleaned_period = re.sub(r"[^a-zA-Z0-9_-]", "_", (period_id or "").strip())
    if cleaned_period:
        return f"{cleaned_period}_{scene_id}"
    return scene_id


def _sanitize_scene_id(scene_id: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "_", scene_id.strip())
    if not cleaned:
        raise ValueError("無效的 sceneId")
    return cleaned[:128]


def _scene_path(scene_id: str) -> Path:
    SCENES_DIR.mkdir(parents=True, exist_ok=True)
    return SCENES_DIR / f"{_sanitize_scene_id(scene_id)}.png"


def _scene_illustration_meta(scene_id: str, path: Path, *, cached: bool) -> dict[str, Any]:
    sanitized = _sanitize_scene_id(scene_id)
    version = int(path.stat().st_mtime)
    return {
        "illustrationId": sanitized,
        "url": f"/api/illustrations/scene/{sanitized}?v={version}",
        "version": version,
        "cached": cached,
    }


def lookup_scene_illustration(scene_id: str) -> dict[str, Any] | None:
    """Return metadata if this scene already has a saved illustration."""
    try:
        path = _scene_path(scene_id)
    except ValueError:
        return None
    if path.exists() and path.stat().st_size > 0:
        return _scene_illustration_meta(scene_id, path, cached=True)
    return None


def get_scene_illustration_path(scene_id: str) -> Path | None:
    try:
        path = _scene_path(scene_id)
    except ValueError:
        return None
    return path if path.exists() and path.stat().st_size > 0 else None


def _resolve_provider() -> ProviderName:
    openai_api_key = _env_secret("OPENAI_API_KEY")
    pollinations_api_key = _env_secret("POLLINATIONS_API_KEY")

    if IMAGE_PROVIDER == "openai":
        if not openai_api_key:
            raise RuntimeError("IMAGE_PROVIDER=openai 但未設定 OPENAI_API_KEY")
        return "openai"
    if IMAGE_PROVIDER == "pollinations":
        if not pollinations_api_key:
            raise RuntimeError(
                "IMAGE_PROVIDER=pollinations 但未設定 POLLINATIONS_API_KEY。"
                "免費舊版 image.pollinations.ai 已停用，請改用 gen.pollinations.ai 金鑰。"
            )
        return "pollinations"
    if openai_api_key:
        return "openai"
    if pollinations_api_key:
        return "pollinations"
    raise RuntimeError(f"未設定 AI 繪圖金鑰。{_PROVIDER_SETUP_HINT}")


def _ssl_context() -> ssl.SSLContext:
    if certifi is not None:
        return ssl.create_default_context(cafile=certifi.where())
    return ssl.create_default_context()


def _http_request(
    request: urllib.request.Request,
    *,
    timeout: int = 120,
) -> bytes:
    try:
        with urllib.request.urlopen(request, timeout=timeout, context=_ssl_context()) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        detail = _redact_secrets(exc.read().decode("utf-8", errors="replace")[:400])
        raise RuntimeError(f"繪圖服務回應 {exc.code}：{detail or exc.reason}") from exc


def _download_bytes(url: str, timeout: int = 120, headers: dict[str, str] | None = None) -> bytes:
    request_headers = {"User-Agent": "story-game/0.1"}
    if headers:
        request_headers.update(headers)
    request = urllib.request.Request(url, headers=request_headers)
    return _http_request(request, timeout=timeout)


def _generate_openai(prompt: str) -> bytes:
    openai_api_key = _env_secret("OPENAI_API_KEY")
    payload = {
        "model": OPENAI_IMAGE_MODEL,
        "prompt": prompt[:4000],
        "n": 1,
        "size": "1024x1024",
        "response_format": "b64_json",
        "quality": "standard",
    }
    request = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    result = json.loads(_http_request(request, timeout=120).decode("utf-8"))

    import base64

    image_b64 = result["data"][0]["b64_json"]
    return base64.b64decode(image_b64)


def _generate_pollinations(prompt: str) -> bytes:
    pollinations_api_key = _env_secret("POLLINATIONS_API_KEY")
    encoded = urllib.parse.quote(prompt[:900])
    url = (
        "https://gen.pollinations.ai/image/"
        f"{encoded}?model={POLLINATIONS_MODEL}"
        f"&width={IMAGE_WIDTH}&height={IMAGE_HEIGHT}&nologo=true&enhance=true"
    )
    return _download_bytes(
        url,
        timeout=180,
        headers={"Authorization": f"Bearer {pollinations_api_key}"},
    )


def _save_scene_copy(scene_id: str, image_bytes: bytes) -> dict[str, Any]:
    scene_file = _scene_path(scene_id)
    scene_file.write_bytes(image_bytes)
    return _scene_illustration_meta(scene_id, scene_file, cached=False)


def generate_illustration(
    narrative: str = "",
    image_prompt: dict[str, Any] | None = None,
    scene_id: str | None = None,
    *,
    force: bool = False,
) -> dict[str, Any]:
    """Generate or return cached illustration metadata."""
    if scene_id and not force:
        existing = lookup_scene_illustration(scene_id)
        if existing:
            return existing

    prompt_data = dict(image_prompt or {})
    if scene_id and scene_id.startswith("deviation_"):
        prompt_data.setdefault("route", "deviation")

    generation_prompt = build_generation_prompt(narrative, prompt_data)
    if not generation_prompt:
        raise ValueError("缺少可用於繪圖的場景描述")

    provider = _resolve_provider()
    illustration_id = _cache_key(generation_prompt, provider)
    cached_file = _cached_path(illustration_id)

    if not force and cached_file.exists() and cached_file.stat().st_size > 0:
        if scene_id:
            return {
                **_save_scene_copy(scene_id, cached_file.read_bytes()),
                "cached": True,
            }
        return {
            "illustrationId": illustration_id,
            "url": f"/api/illustrations/{illustration_id}.png",
            "cached": True,
        }

    if provider == "openai":
        try:
            image_bytes = _generate_openai(generation_prompt)
        except Exception:
            if IMAGE_PROVIDER == "openai":
                raise
            if not _env_secret("POLLINATIONS_API_KEY"):
                raise
            provider = "pollinations"
            illustration_id = _cache_key(generation_prompt, provider)
            cached_file = _cached_path(illustration_id)
            image_bytes = _generate_pollinations(generation_prompt)
    else:
        image_bytes = _generate_pollinations(generation_prompt)

    cached_file.write_bytes(image_bytes)
    if scene_id:
        return _save_scene_copy(scene_id, image_bytes)
    return {
        "illustrationId": illustration_id,
        "url": f"/api/illustrations/{illustration_id}.png",
        "cached": False,
    }


def get_illustration_path(illustration_id: str) -> Path | None:
    safe_id = illustration_id.removesuffix(".png")
    if not safe_id or not all(ch in "0123456789abcdef" for ch in safe_id):
        return None
    path = _cached_path(safe_id)
    return path if path.exists() else None
