FROM node:24.14.0-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

ENV YARN_ENABLE_GLOBAL_CACHE=false

COPY .yarn ./.yarn
COPY package.json yarn.lock .pnp.cjs .pnp.loader.mjs ./
COPY nest-cli.json tsconfig.build.json tsconfig.json ./

RUN yarn install --immutable

COPY src ./src

RUN yarn build

FROM node:24.14.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV YARN_ENABLE_GLOBAL_CACHE=false

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "const s=require('net').createServer().listen(3002);s.close();" || exit 1

CMD ["node", "--require", "./.pnp.cjs", "dist/main"]
