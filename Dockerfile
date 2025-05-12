FROM node:22.15.0-slim AS build

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application source code and compile TypeScript
COPY . .
RUN yarn build

FROM node:22.15.0-slim AS production
ENV NODE_ENV=production

WORKDIR /app

# Copy compiled files from build stage
COPY --from=build /app/dist ./dist

# Install production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

CMD ["node", "dist/server.js"]
