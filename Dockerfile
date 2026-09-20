# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# --- dev: hot-reload, исходники монтируются снаружи, node_modules — в отдельном volume ---
FROM base AS dev
RUN mkdir -p /app/node_modules /app/.nuxt && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm install && npx nuxt dev --host 0.0.0.0 --port 3000"]

# --- build: статическая сборка ---
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NUXT_APP_BASE_URL=/
ENV NUXT_APP_BASE_URL=$NUXT_APP_BASE_URL
RUN npm run build

# --- web: nginx отдаёт .output/public ---
FROM nginx:alpine AS web
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 8080
