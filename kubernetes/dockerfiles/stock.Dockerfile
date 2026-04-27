# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY backend-stock-usage/package*.json ./
RUN npm install --production

COPY backend-stock-usage/ ./

# Runtime stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

EXPOSE 5003

CMD ["node", "src/server.js"]
