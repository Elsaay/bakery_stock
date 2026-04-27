FROM node:18-alpine

WORKDIR /app

COPY backend-products/package*.json ./
RUN npm install --omit=dev

COPY backend-products/ ./

EXPOSE 5001

CMD ["node", "src/server.js"]
