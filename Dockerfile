FROM node:25.9.0-slim AS build

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

FROM node:25.9.0-slim AS production
ENV NODE_ENV=production

USER node
WORKDIR /app

# Install only production dependencies
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy compiled files from build stage
COPY --from=build --chown=node:node /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/server.js"]
