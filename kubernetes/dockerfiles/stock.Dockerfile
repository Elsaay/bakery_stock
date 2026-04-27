FROM node:18-alpine

WORKDIR /app

COPY backend-stock-usage/package*.json ./
RUN npm install --omit=dev

COPY backend-stock-usage/ ./

EXPOSE 5003

CMD ["node", "src/server.js"]
