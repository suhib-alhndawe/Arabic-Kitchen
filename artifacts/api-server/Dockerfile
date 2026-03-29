FROM node:18-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json tsconfig.json build.mjs .npmrc ./
COPY src ./src

RUN pnpm install --no-frozen-lockfile
RUN pnpm run build

FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.mjs"]
