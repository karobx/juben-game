# 劇本遊戲 — 單一 container：FastAPI + 預建 Vite 靜態前端（HostingGuru / Coolify）
# frontend/dist 已 commit；唔再喺 build 跑 npm，縮短 build 時間同失敗點。
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements-deploy.txt ./backend/requirements-deploy.txt
RUN pip install --no-cache-dir -r backend/requirements-deploy.txt
COPY backend/ ./backend/
COPY frontend/dist ./frontend/dist
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=10s --start-period=90s --retries=6 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:3000/api/health', timeout=8)" || exit 1
# Exec form — 唔用 bash/cd；HostingGuru healthcheck 固定 localhost:3000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000", "--log-level", "info"]
