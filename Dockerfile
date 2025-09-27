FROM node:22.15.0-slim AS build

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

FROM node:22.15.0-slim AS production
ENV NODE_ENV=production
ENV PORT=8000

# Create non-root user for security
RUN addgroup --system nodejs && \
    adduser --system --ingroup nodejs nodejs
USER nodejs

WORKDIR /app

# Copy compiled files from build stage
COPY --from=build /app/dist ./dist

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT:-8000}/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]
