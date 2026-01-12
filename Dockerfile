FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i --omit=dev --ignore-scripts

RUN npm i -D typescript tsc-alias @types/node

COPY . .

RUN npm run db:generate

RUN npm run build

FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "./dist/src/index.js"]
