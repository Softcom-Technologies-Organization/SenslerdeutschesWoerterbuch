# Production Dockerfile for frontend
FROM node:lts-alpine AS builder
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm ci
COPY ./frontend/ ./
RUN npm run build --configuration=production

FROM nginx:stable-alpine
COPY --from=builder /app/dist/senslerdeutsches-woerterbuch/browser /usr/share/nginx/html
COPY ./docker/proxy/default.conf.template /etc/nginx/templates/default.conf.template

# Add SSL certificates for production
# COPY ./certs/cert.pem /etc/nginx/ssl/cert.pem
# COPY ./certs/key.pem /etc/nginx/ssl/key.pem

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]