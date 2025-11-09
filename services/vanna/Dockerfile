# services/vanna/Dockerfile
FROM python:3.11-slim

# Ensure apt has curl + build essentials if needed (curl used by healthcheck)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy requirements and install (use --no-cache-dir)
COPY requirements.txt ./

# If pip downloads time out during build on your network, rebuild on host once
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

EXPOSE 8000

# Start
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
