# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY boulangerie_stock/package*.json ./
RUN npm install

COPY boulangerie_stock/ ./

ARG REACT_APP_PRODUCTS_URL=http://localhost:30001
ARG REACT_APP_ORDERS_URL=http://localhost:30002
ARG REACT_APP_STOCK_URL=http://localhost:30003

ENV REACT_APP_PRODUCTS_URL=$REACT_APP_PRODUCTS_URL
ENV REACT_APP_ORDERS_URL=$REACT_APP_ORDERS_URL
ENV REACT_APP_STOCK_URL=$REACT_APP_STOCK_URL

RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY kubernetes/dockerfiles/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
