FROM node:24-alpine3.21 AS base

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

FROM base AS development
RUN pnpm install
COPY . .
EXPOSE 80
CMD ["pnpm", "run", "dev"]

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base AS production

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist

COPY --from=build /app/package.json ./

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/api/v1/health || exit 1

  CMD ["pnpm", "start"]