FROM node:lts-alpine AS builder
WORKDIR /app
# Step 1: Copy package.json files only
# This layer changes only when dependencies change
COPY ./frontend/package*.json ./

# Step 2: Install dependencies
# This expensive operation will be cached if package files don't change
RUN npm ci

# Step 3: Copy the rest of the source code
# This layer changes with every code change, but doesn't trigger dependency reinstall
COPY ./frontend/ ./

# Step 4: Build the app
RUN npm run build --configuration=production

FROM nginx:stable-alpine
COPY --from=builder /app/dist/senslerdeutsches-woerterbuch/browser /usr/share/nginx/html
COPY ./docker/frontend/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]