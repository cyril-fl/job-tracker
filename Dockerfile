# Stage 1: Base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY app/api/package.json app/api/
COPY app/client/package.json app/client/
COPY app/shared/package.json app/shared/
RUN pnpm install --frozen-lockfile

# Stage 3: Build client
FROM deps AS build-client
COPY app/client/ app/client/
COPY app/shared/ app/shared/
COPY tsconfig.base.json ./
RUN pnpm --filter client run build

# Stage 4: Production API image
FROM base AS production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY app/api/package.json app/api/
COPY app/client/package.json app/client/
COPY app/shared/package.json app/shared/
RUN pnpm install --frozen-lockfile

COPY app/api/ app/api/
COPY app/shared/ app/shared/
COPY tsconfig.base.json ./

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/job-tracker.db

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "pnpm --filter api run db:migrate && pnpm --filter api run dev:prod"]
