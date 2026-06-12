# 劇本遊戲 — 單一 container：FastAPI + Vite 靜態前端（方案 B / HostingGuru）
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements-deploy.txt ./backend/requirements-deploy.txt
RUN pip install --no-cache-dir -r backend/requirements-deploy.txt
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=45s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:3000/api/health')" || exit 1
# Exec form — no bash/cd; HostingGuru probes localhost:3000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
