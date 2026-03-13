FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY app/api/package.json app/api/
COPY app/client/package.json app/client/
COPY app/shared/package.json app/shared/
RUN pnpm install --frozen-lockfile

# Build client
COPY app/client/ app/client/
COPY app/shared/ app/shared/
COPY tsconfig.base.json ./
RUN pnpm --filter client run build

# Nginx stage
FROM nginx:alpine
COPY --from=0 /app/app/client/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
