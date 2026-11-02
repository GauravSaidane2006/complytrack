FROM node:20-alpine AS base

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

RUN addgroup -g 1001 -S complytrack && \
    adduser -S complytrack -u 1001 -G complytrack

COPY src ./src

RUN mkdir -p uploads reports sector-pdfs notices && \
    chown -R complytrack:complytrack /app

USER complytrack

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]
