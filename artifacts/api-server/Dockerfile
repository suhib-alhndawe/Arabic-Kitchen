# -------------------------------------------------
#  API Server - Node 18 (Alpine) + PNPM
# -------------------------------------------------
FROM node:18-alpine AS builder

# Install PNPM
RUN npm install -g pnpm@9

WORKDIR /app

# Copy lockfile and workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy the specific package and its internal dependencies
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/db/package.json ./lib/db/
COPY lib/api-client-react/package.json ./lib/api-client-react/

# Install dependencies (frozen lockfile for production stability)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY artifacts/api-server ./artifacts/api-server
COPY lib/db ./lib/db
COPY lib/api-client-react ./lib/api-client-react
COPY tsconfig.json tsconfig.base.json ./

# Build the server (esbuild bundle)
RUN pnpm --filter api-server run build

# -------------------------------------------------
#  Runtime image
# -------------------------------------------------
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy built files and package.json
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/package.json ./package.json

# Copy production node_modules from the api-server package
# Note: In a workspace, this might be tricky; often it is better 
# to use a bundle or copy the entire node_modules from root.
# For simplicity, since the build is a bundle (esbuild), we only need runtime deps.
# However, esbuild -platform=node usually marks some things as external.
COPY --from=builder /app/node_modules ./node_modules

# Ensure uploads directory exists
RUN mkdir -p uploads

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.mjs"]
