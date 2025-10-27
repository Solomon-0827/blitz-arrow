# Use the official lightweight Bun image
FROM oven/bun:latest AS base

# Set working directory
WORKDIR /app

# Create a non-root user for running the production application
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Change to non-root user
USER nextjs

# Copy necessary files for production
COPY ./apps/admin/.next/standalone ./
COPY ./apps/admin/.next/static ./apps/admin/.next/static
COPY ./apps/admin/public ./apps/admin/public

# Disable Next.js telemetry at runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Set default command
CMD ["bun", "apps/admin/server.js"]
