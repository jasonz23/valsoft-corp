FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/support_ops?schema=public \
    DIRECT_URL=postgresql://postgres:postgres@localhost:5432/support_ops?schema=public \
    npm run prisma:generate --workspace api
RUN npm run build --workspace @valsoft/shared
RUN npm run build --workspace api

FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000
CMD ["npm", "run", "start:prod", "--workspace", "api"]
