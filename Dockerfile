# Use lightweight Node.js base image
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies needed for build
RUN npm ci

# Copy rest of the files
COPY . .

# Build the client static assets and package backend server
RUN npm run build

# --- Production Environment ---
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package.json to run production npm install
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy distribution files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Expose port and start server
EXPOSE 3000
CMD ["npm", "run", "start"]
