# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so they
# must be present now (not at runtime). BACKEND_URL is used by the rewrites.
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_URL=$BACKEND_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the standalone server output + static assets.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# BACKEND_URL is also read at runtime by the rewrites in next.config.mjs.
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

EXPOSE 3000
CMD ["node", "server.js"]
