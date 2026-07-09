FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules

COPY --from=builder --chown=node:node /usr/src/app/package*.json ./

COPY --chown=node:node app.js ./app.js

EXPOSE 3000

USER node

CMD ["node", "app.js"]