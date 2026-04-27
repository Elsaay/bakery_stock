FROM node:18-alpine

WORKDIR /app

COPY backend-orders/package*.json ./
RUN npm install --omit=dev

COPY backend-orders/ ./

EXPOSE 5002

CMD ["node", "src/server.js"]
