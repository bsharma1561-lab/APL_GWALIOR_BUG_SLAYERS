# ==========================================
# STAGE 1: Build the React static frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and build
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Build the Production Server
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy output files from builder
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/package*.json ./

# Only install production dependencies
RUN npm ci --only=production

# Expose Port 3000
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
