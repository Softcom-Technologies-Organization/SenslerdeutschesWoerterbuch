FROM node:lts-alpine AS builder
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm ci
COPY ./frontend/ ./
ARG NG_ENV=production
# The additional -- are actually required to pass the argument to the command
RUN npm run build -- --configuration=production,$NG_ENV

FROM nginx:stable-alpine
COPY ./docker/public-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/senslerdeutsches-woerterbuch/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]