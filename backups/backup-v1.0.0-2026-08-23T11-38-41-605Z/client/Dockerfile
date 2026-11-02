FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci && npm cache clean --force

COPY . .

ARG VITE_API_URL=/api
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache dumb-init && \
    rm -rf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
