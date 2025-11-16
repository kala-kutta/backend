FROM oven/bun:1 AS base

# Install sum deps
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

FROM base AS install
COPY . .
RUN bun install --frozen-lockfile

FROM install AS serve
RUN bunx --bun prisma generate


USER bun
EXPOSE 3000/tcp
EXPOSE 4000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]