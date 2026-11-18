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
# Exact versions from package-lock.json (never silently upgrade/downgrade next).
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run as an unprivileged user so a compromise of the Next.js process can't act
# as root inside the container.
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

# Copy only the standalone server output + static assets. The nextjs user owns
# them so Next can write its image cache under .next/cache.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# BACKEND_URL is also read at runtime by the rewrites in next.config.mjs.
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
