FROM node:22.15.0-slim AS build

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

FROM node:22.15.0-slim AS production
ENV NODE_ENV=production

WORKDIR /app

# Copy compiled files from build stage
COPY --from=build /app/dist ./dist

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

CMD ["node", "dist/server.js"]
