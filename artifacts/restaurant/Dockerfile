# -------------------------------------------------
#  Front-End - Build stage (Node)
# -------------------------------------------------
FROM node:18-alpine AS builder

# Install PNPM
RUN npm install -g pnpm@9

WORKDIR /app

# Install deps (workspace aware)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY artifacts/restaurant/package.json ./artifacts/restaurant/
COPY lib/api-client-react/package.json ./lib/api-client-react/

RUN pnpm install --frozen-lockfile

# Copy the specific package and its internal dependencies
COPY artifacts/restaurant ./artifacts/restaurant
COPY lib/api-client-react ./lib/api-client-react
COPY tsconfig.json tsconfig.base.json ./

# Build the static site
RUN pnpm --filter restaurant run build

# -------------------------------------------------
#  Runtime - Nginx to serve static assets
# -------------------------------------------------
FROM nginx:stable-alpine AS runtime

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY artifacts/restaurant/nginx.conf /etc/nginx/conf.d/

# Copy built assets
COPY --from=builder /app/artifacts/restaurant/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
