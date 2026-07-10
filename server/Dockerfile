FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p uploads reports sector-pdfs notices

EXPOSE 5000

CMD ["npm", "start"]
