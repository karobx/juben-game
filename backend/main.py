"""FastAPI application for interactive story game."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parent
_DIST = _BACKEND_DIR.parent / "frontend" / "dist"
load_dotenv(_BACKEND_DIR.parent / ".env")
load_dotenv(_BACKEND_DIR / ".env")

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from services.image_service import (
    generate_illustration,
    get_illustration_path,
    get_scene_illustration_path,
    lookup_scene_illustration,
)
from services.nlp_service import analyze_text
from services.pdf_service import extract_text_from_file
from services.storage_service import get_file_path, upload_file
from services.story_generator import enrich_story_graph, generate_story_graph, load_fixture
from services import chistory_service, task_service

app = FastAPI(title="互動故事遊戲 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    fileId: str | None = None
    storagePath: str | None = None
    useFixture: bool = False


class IllustrationRequest(BaseModel):
    narrative: str = ""
    imagePrompt: dict | None = None
    force: bool = False
    sceneId: str | None = None


def _run_analysis_task(task_id: str, path: Path) -> None:
    try:
        text = extract_text_from_file(path)
        title = Path(path.name).stem
        analysis = analyze_text(text, title=title)
        story_graph = generate_story_graph(analysis)
        task_service.complete_task(task_id, analysis, story_graph)
    except Exception as exc:
        task_service.fail_task(task_id, str(exc))


@app.get("/api/health")
def health():
    return {"status": "ok", "dist": _DIST.exists()}


@app.on_event("startup")
def _log_startup() -> None:
    print(f"[startup] serving SPA from {_DIST} (exists={_DIST.exists()})", flush=True)


@app.post("/api/upload")
async def api_upload(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="請選擇檔案")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".pdf", ".txt"}:
        raise HTTPException(status_code=400, detail="只支援 PDF 或 TXT 檔案")

    content = await file.read()
    max_bytes = 20 * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail="檔案太大（上限 20MB）")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="檔案是空的")

    try:
        result = upload_file(content, file.filename)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"上傳失敗：{exc}") from exc

    return result


@app.get("/api/files/{file_id}")
def api_get_file(file_id: str):
    path = get_file_path(file_id)
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail="找不到檔案")
    return FileResponse(path)


@app.post("/api/analyze")
def api_analyze(body: AnalyzeRequest, background_tasks: BackgroundTasks):
    if body.useFixture:
        analysis = {
            "title": "秦漢大一統：從始皇到光武",
            "characters": [
                {"name": "秦始皇", "mentions": 4},
                {"name": "漢武帝", "mentions": 3},
                {"name": "張騫", "mentions": 2},
                {"name": "光武帝", "mentions": 2},
            ],
            "plotBeats": [
                {"order": 1, "summary": "秦始皇統一六國，推行書同文、車同軌"},
                {"order": 2, "summary": "秦朝暴政與覆亡，漢承秦制而改之"},
                {"order": 3, "summary": "漢武帝推恩令、獨尊儒術，鞏固大一統"},
                {"order": 4, "summary": "張騫通西域，開闢絲綢之路"},
                {"order": 5, "summary": "東漢光武中興，外戚宦官專權"},
            ],
            "settings": ["咸陽", "長安", "西域"],
            "rawTextLength": 0,
            "engine": "fixture",
        }
        graph = load_fixture()
        graph["title"] = analysis["title"]
        enrich_story_graph(graph, analysis)
        return {"status": "completed", "analysis": analysis, "storyGraph": graph}

    path: Path | None = None
    if body.storagePath and Path(body.storagePath).exists():
        path = Path(body.storagePath)
    elif body.fileId:
        path = get_file_path(body.fileId)

    if path is None:
        raise HTTPException(status_code=404, detail="找不到要分析的檔案")

    task_id = task_service.create_task()
    background_tasks.add_task(_run_analysis_task, task_id, path)
    return {"status": "processing", "taskId": task_id}


@app.get("/api/analyze/tasks/{task_id}")
def api_analyze_task(task_id: str):
    task = task_service.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="找不到分析任務")

    payload: dict = {"status": task["status"], "taskId": task["taskId"]}
    if task["status"] == "completed":
        payload["analysis"] = task["analysis"]
        payload["storyGraph"] = task["storyGraph"]
    elif task["status"] == "failed":
        payload["error"] = task["error"]

    return payload


@app.get("/api/story/demo")
def api_story_demo():
    graph = load_fixture()
    enrich_story_graph(graph, {"settings": ["咸陽", "長安", "西域"]})
    return graph


@app.post("/api/illustrations/generate")
def api_generate_illustration(body: IllustrationRequest):
    try:
        return generate_illustration(
            body.narrative,
            body.imagePrompt,
            body.sceneId,
            force=body.force,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="繪圖失敗，請稍後再試") from exc


@app.get("/api/illustrations/scene/{scene_id}/lookup")
def api_lookup_scene_illustration(scene_id: str):
    meta = lookup_scene_illustration(scene_id)
    if meta is None:
        raise HTTPException(status_code=404, detail="此場景尚未有插畫")
    return meta


@app.get("/api/illustrations/scene/{scene_id}")
def api_get_scene_illustration(scene_id: str):
    path = get_scene_illustration_path(scene_id)
    if path is None:
        raise HTTPException(status_code=404, detail="找不到場景插畫")
    return FileResponse(
        path,
        media_type="image/png",
        headers={"Cache-Control": "no-cache"},
    )


@app.get("/api/illustrations/{illustration_id}")
def api_get_illustration(illustration_id: str):
    path = get_illustration_path(illustration_id)
    if path is None:
        raise HTTPException(status_code=404, detail="找不到插畫")
    return FileResponse(path, media_type="image/png")


@app.get("/api/chistory/periods")
def api_chistory_periods():
    try:
        return {"periods": chistory_service.list_periods()}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/chistory/periods/{period_id}")
def api_chistory_period(period_id: str):
    if period_id not in chistory_service.PERIOD_IDS:
        raise HTTPException(status_code=404, detail="找不到此歷史時期")
    try:
        return chistory_service.get_period_playable(period_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


if _DIST.exists():
    app.mount("/", StaticFiles(directory=_DIST, html=True), name="spa")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
