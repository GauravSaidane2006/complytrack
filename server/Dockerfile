FROM node:20-alpine

WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Express server port
EXPOSE 5000

# Start the app (src/app.js is your entry point)
CMD ["npm", "start"]
