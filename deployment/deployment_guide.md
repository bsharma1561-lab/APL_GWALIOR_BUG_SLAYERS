# 🏏 AI Cricket Commentary Generator — Production Deployment Guide

This guide details the system architecture, scaling recommendations, and step-by-step production deployments on Google Cloud Platform (GCP) or Amazon Web Services (AWS).

---

## 🏗️ System Architecture

Our solution utilizes a highly scalable, full-stack event-driven structure.

```
       [ Client Web Applications (React + Tailwind) ]
                            │
               (WebSockets / Server-Sent Events / HTTPS)
                            │
                            ▼
          [ Nginx Reverse Proxy / SSL Termination ]
                            │
                            ▼
         [ Full-Stack Server Group: Express & Node ] <──> [ Redis Cache ]
                            │                               (Live Streaming Feed)
                            ▼
          [ Gemini AI / LLM APIs / Local Llama PEFT ]
```

1. **Client Tier**: Fully responsive, animated React board mirroring ESPN Cricinfo with win sliders and live ball indicators. Uses native `SpeechSynthesis` and server-buffered chunks for vocalizing commentary.
2. **Streaming Gateway**: An Express API hosting high-performance HTTP endpoints (`/api/generate-commentary`, etc.) and a Server-Sent Events (SSE) `/api/live-feed` stream.
3. **Caching & Queueing System (Redis)**: Caches generated commentary blocks, stores real-time ballpark configurations, and acts as a buffer to throttle API spikes during major match events (IPL finals, powerplay boundaries).
4. **AI Generation Engine**: Proxies requests securely to the **Gemini 3.5 Flash** model with advanced custom prompts. It utilizes custom prompt styles tailored to deliver highly authentic, context-aware narratives.

---

## 🚀 Deployment Instructions

### Option 1: Google Cloud Run (Containerized & Serverless)

Cloud Run offers zero-to-one auto-scaling, which is highly cost-effective and perfectly handles the sudden traffic spikes of major cricket events.

1. **Configure Environment Variables**:
   Prepare a secure secrets list in Google Secret Manager:
   - `GEMINI_API_KEY`: Secrets securely mounted to Cloud Run containers or fetched at launch.

2. **Build and Tag Container**:
   ```bash
   gcloud builds submit --tag gcr.io/your-project-id/cricket-commentary-service --file docker/Dockerfile
   ```

3. **Deploy to Cloud Run VM**:
   ```bash
   gcloud run deploy cricket-commentary-engine \
     --image gcr.io/your-project-id/cricket-commentary-service \
     --platform managed \
     --region asia-east1 \
     --set-env-vars="NODE_ENV=production,PORT=3000" \
     --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
     --allow-unauthenticated \
     --port=3000
   ```

---

### Option 2: Docker Compose (Local or Single VPS)

Perfect for isolated on-premise testing or single EC2/Compute Engine instances.

1. Clone repository to your VM.
2. Set your environment values:
   ```bash
   echo "GEMINI_API_KEY=AIzaSyYourSecretAPIKeyFromStudio" > .env
   ```
3. Boot the full container stack:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d --build
   ```
4. Access the dashboard instantly at `http://localhost:3000`.

---

## 📈 Scalability and Performance Optimization

1. **Redis Caching**: Frequently repeated structured outcomes (e.g., standard dot balls, broad singles) are indexed with matching hashes in Redis to minimize LLM invocation costs and maintain sub-100ms response times.
2. **Rate Limiting**: Apply sliding-window express rate limit configurations to the ball submission routes to prevent malicious DDOS attempts from overwhelming LLM quota parameters.
3. **API Key Rotation**: For sports newsrooms generating millions of commentaries per minute during IPL, pool multiple project keys using an internal gateway rotation script.
