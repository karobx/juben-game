"""In-memory analysis task store for async background processing."""

from __future__ import annotations

import threading
import uuid
from datetime import UTC, datetime
from typing import Any, Literal

TaskStatus = Literal["processing", "completed", "failed"]

_lock = threading.Lock()
_tasks: dict[str, dict[str, Any]] = {}


def create_task() -> str:
    task_id = str(uuid.uuid4())
    with _lock:
        _tasks[task_id] = {
            "taskId": task_id,
            "status": "processing",
            "analysis": None,
            "storyGraph": None,
            "error": None,
            "createdAt": datetime.now(UTC).isoformat(),
        }
    return task_id


def get_task(task_id: str) -> dict[str, Any] | None:
    with _lock:
        task = _tasks.get(task_id)
        return dict(task) if task else None


def complete_task(task_id: str, analysis: dict[str, Any], story_graph: dict[str, Any]) -> None:
    with _lock:
        task = _tasks.get(task_id)
        if task is None:
            return
        task["status"] = "completed"
        task["analysis"] = analysis
        task["storyGraph"] = story_graph
        task["error"] = None


def fail_task(task_id: str, error: str) -> None:
    with _lock:
        task = _tasks.get(task_id)
        if task is None:
            return
        task["status"] = "failed"
        task["error"] = error
