# Use official Node.js Alpine image for lightweight builds
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Create and set working directory
WORKDIR /app

# Copy only necessary files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy rest of the app
COPY . .

# Build the Next.js app
RUN pnpm build

# ================================
# PRODUCTION IMAGE
# ================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally again
RUN npm install -g pnpm

# Copy only the built output and essentials
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules ./node_modules

# If you're using env vars like `.env.local`
COPY .env.local .env.local

# Expose Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["pnpm", "start"]
