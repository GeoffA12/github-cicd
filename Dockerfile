# ── Base image ──────────────────────────────────────────────────────────────
FROM python:3.12-slim

# ── Metadata ─────────────────────────────────────────────────────────────────
LABEL org.opencontainers.image.source="https://github.com/geoffarroyo/aws-cicd-tutorial"
LABEL org.opencontainers.image.description="Hello World HTTP server — Docker publish tutorial"

# ── App setup ────────────────────────────────────────────────────────────────
WORKDIR /app

# Copy only the application source (no node_modules, cdk.out, etc.)
COPY app/main.py .

# ── Runtime ──────────────────────────────────────────────────────────────────
EXPOSE 8080

CMD ["python", "main.py"]
