FROM node:22-bookworm-slim AS frontend-builder

RUN npm install -g pnpm@9

WORKDIR /frontend

COPY frontend/package.json frontend/tsconfig.json frontend/vite.config.ts frontend/index.html frontend/.npmrc ./
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/attached_assets ./attached_assets

RUN pnpm install --no-frozen-lockfile
ENV BASE_PATH=/
ENV PORT=4173
ENV NODE_ENV=production
RUN pnpm run build

FROM node:18-alpine AS api-builder

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json tsconfig.json build.mjs .npmrc ./
COPY src ./src

RUN pnpm install --no-frozen-lockfile
RUN pnpm run build

FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/dist ./dist
COPY --from=api-builder /app/package.json ./package.json
COPY --from=frontend-builder /frontend/dist ./public

RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.mjs"]
