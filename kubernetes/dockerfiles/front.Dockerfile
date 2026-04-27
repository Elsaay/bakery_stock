FROM node:18-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

ARG REACT_APP_PRODUCTS_URL
ARG REACT_APP_ORDERS_URL
ARG REACT_APP_STOCK_URL

RUN test -n "$REACT_APP_PRODUCTS_URL" \
 && test -n "$REACT_APP_ORDERS_URL" \
 && test -n "$REACT_APP_STOCK_URL"

ENV REACT_APP_PRODUCTS_URL=$REACT_APP_PRODUCTS_URL
ENV REACT_APP_ORDERS_URL=$REACT_APP_ORDERS_URL
ENV REACT_APP_STOCK_URL=$REACT_APP_STOCK_URL

COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY kubernetes/dockerfiles/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
