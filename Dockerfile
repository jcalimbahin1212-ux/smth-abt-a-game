# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files from game directory
COPY PROJECT_DEATHBED/game/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code from game directory
COPY PROJECT_DEATHBED/game/ .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
