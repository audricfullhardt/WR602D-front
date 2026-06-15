# syntax=docker/dockerfile:1

# --- Stage 1 : build du bundle Vite ---
FROM node:20-alpine AS builder

WORKDIR /app

# Variable de build Vite (inlinée dans le bundle au build).
# Fournie par docker-compose (build.args) ou via --build-arg.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

# Installation des dépendances (cache Docker tant que les lockfiles ne changent pas)
COPY package.json package-lock.json ./
RUN npm ci

# Code source + build statique
COPY . .
RUN npm run build

# --- Stage 2 : serveur statique Nginx ---
FROM nginx:alpine

# Config SPA (fallback index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Artefacts buildés uniquement
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
