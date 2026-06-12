"""Local or Firebase file storage."""

from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import Any

STORAGE_MODE = os.getenv("STORAGE_MODE", "local")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))


def _ensure_upload_dir() -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


def upload_file(content: bytes, filename: str) -> dict[str, Any]:
    """Store file locally or in Firebase Storage."""
    file_id = str(uuid.uuid4())
    safe_name = Path(filename).name
    ext = Path(safe_name).suffix.lower()

    if STORAGE_MODE == "firebase":
        return _upload_firebase(content, file_id, safe_name)

    upload_dir = _ensure_upload_dir()
    dest = upload_dir / f"{file_id}{ext}"
    dest.write_bytes(content)
    return {
        "fileId": file_id,
        "filename": safe_name,
        "storagePath": str(dest),
        "url": f"/api/files/{file_id}",
        "mode": "local",
    }


def get_file_path(file_id: str) -> Path | None:
    upload_dir = _ensure_upload_dir()
    for path in upload_dir.glob(f"{file_id}.*"):
        return path
    return None


def _upload_firebase(content: bytes, file_id: str, filename: str) -> dict[str, Any]:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
    if not cred_path or not bucket_name:
        raise RuntimeError("Firebase 未設定：請設定 FIREBASE_CREDENTIALS_PATH 與 FIREBASE_STORAGE_BUCKET")

    import firebase_admin
    from firebase_admin import credentials, storage

    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {"storageBucket": bucket_name})

    blob_path = f"uploads/{file_id}/{filename}"
    bucket = storage.bucket()
    blob = bucket.blob(blob_path)
    blob.upload_from_string(content)
    blob.make_public()
    return {
        "fileId": file_id,
        "filename": filename,
        "storagePath": blob_path,
        "url": blob.public_url,
        "mode": "firebase",
    }
